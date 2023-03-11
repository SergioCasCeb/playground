// Test utility to test index.js
const tdValidator = require("../../index").tdValidator;

const simpleTD = JSON.stringify({
    id: "urn:simple",
    "@context": "https://www.w3.org/2022/wot/td/v1.1",
    title: "MyLampThing",
    description: "Valid TD copied from the spec's first example",
    securityDefinitions: {
        basic_sc: {
            scheme: "basic",
            in: "header",
        },
    },
    security: ["basic_sc"],
    properties: {
        status: {
            type: "string",
            forms: [
                {
                    href: "https://mylamp.example.com/status",
                },
            ],
        },
    },
    actions: {
        toggle: {
            forms: [
                {
                    href: "https://mylamp.example.com/toggle",
                },
            ],
        },
    },
    events: {
        overheating: {
            data: {
                type: "string",
            },
            forms: [
                {
                    href: "https://mylamp.example.com/oh",
                    subprotocol: "longpoll",
                },
            ],
        },
    },
});

tdValidator(simpleTD, console.log, {}).then(
    (result) => {
        console.log("OKAY");
        console.log(result);
    },
    (err) => {
        console.log("ERROR");
        console.error(err);
    }
);
