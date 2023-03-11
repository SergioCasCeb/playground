// Test utility to test index.js
const tdAsserter = require("../index").tdAssertions;
const fs = require("fs");

const simpleTD = {
    id: "urn:simple",
    "@context": "https://www.w3.org/2019/wot/td/v1",
    title: "MyLampThing",
    description: "Valid TD copied from the specs first example",
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
};
const TD1 = JSON.stringify(simpleTD);
simpleTD.id = "urn:simple2";
const TD2 = Buffer.from(JSON.stringify(simpleTD), "utf8");

function fileLoad(loc) {
    return new Promise((res, rej) => {
        fs.readFile(loc, "utf8", (err, data) => {
            if (err) {
                rej(err);
            } else {
                res(data);
            }
        });
    });
}

function customLog(input) {
    console.log(">>> " + input);
}

tdAsserter([TD1, TD2], fileLoad, customLog).then(
    (result) => {
        console.log("OKAY");
        console.log(result);
    },
    (err) => {
        console.log("ERROR");
        console.error(err);
    }
);
