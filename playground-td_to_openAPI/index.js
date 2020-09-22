const SwaggerParser = require("swagger-parser")
const YAML = require("json-to-pretty-yaml")

module.exports = toOpenAPI

function toOpenAPI(td) {
    return new Promise( (res, rej) => {
        /* required */
        const openapi = "3.0.3"
        const info = createInfo(td)
        const paths = crawlPaths(td)

        /* optional */
        const servers = crawlServers(td.base)
        const components = {}
        const security = {}
        const tags = addTags(td)
        const externalDocs = new ExternalDocs(
            "http://plugfest.thingweb.io/playground/",
            "This OAP specification was generated from a Web of Things (WoT) - Thing Description by the WoT Playground"
        )

        const API = {
            openapi,
            info,
            paths
        }
        if (servers.length > 0) {API.servers = servers}
        if (tags.length > 0) {API.tags = tags}


        SwaggerParser.validate(API).then( () => {
            res({json: API, yaml: YAML.stringify(API)})
        }, err => {
            console.log(JSON.stringify(API, undefined, 4))
            rej(err)
        })
    })
}

/* ####### FUNCTIONS #############*/

function createInfo(td) {
    const cInfo = {}
    // add title
    /* is required for valid TDs but not to constrain testing
       TDs are not necessarily validated before OpenAPI generation
       e.g. test upcoming TD spec features */
    if (td.title !== undefined) {
        cInfo.title = td.title
    }
    else {
        cInfo.title = "Thing Description Playground autogenerated OpenAPI object"
    }

    // add version
    if (td.version && td.version.instance) {
        cInfo.version = td.version.instance
    }
    else {
        cInfo.version = "unknown"
    }

    // add description
    if (td.description !== undefined) {
        cInfo.description = td.description
    }
    // add optional custom fields
    // TODO: parse descriptions and titles -> description title ???
    const tdOpts = ["@context", "@type", "created", "descriptions", "id", "links", "modified", "name", "titles"]
    tdOpts.forEach( prop => {
        if (td[prop] !== undefined) {
            cInfo["x-" + prop] = td[prop]
        }
    })

    return cInfo
}

function crawlPaths(td) {
    const cPaths = {}
    const interactions = ["properties", "actions"]
    const httpBase = td.base && (td.base.startsWith("http://") || td.base.startsWith("https://")) ? true : false 

    // crawl Interaction Affordances forms
    interactions.forEach( interaction => {
        if (td[interaction] !== undefined) {
            Object.keys(td[interaction]).forEach( interactionName => {
                td[interaction][interactionName].forms.forEach( form => {

                    // generate interactions tag
                    const mapToSingular = {
                        properties: "property",
                        actions: "action"
                    }
                    const tags = [mapToSingular[interaction]]

                    // define type
                    const mapDefaults = {
                        properties: ["readproperty", "writeproperty"],
                        actions: "invokeaction"
                    }
                    const myOp = form.op ? form.op : mapDefaults[interaction]

                    addForm(form, tags, myOp)
                })
            })
        }
    })

    // crawl multiple Interaction forms
    if (td.forms) {
        td.forms.forEach( form => {

            // generate interactions tag
            const tags = ["property"]

            // require op
            if (form.op) {
                addForm(form, tags, form.op)
            }
        })
    }

    function addForm(form, tags, myOp) {
        if (form.href.startsWith("http://") || form.href.startsWith("https://") || httpBase) {
            // add the operation
            const {path, server} = extractPath(form.href)

            if (!cPaths[path]) {cPaths[path] = {}}

            // define content type of response
            let contentType
            if (form.response && form.response.contentType) {
                contentType = form.response.contentType
            }
            else { // if response is not defined explicitly use general interaction content Type
                if (form.contentType) {
                    contentType = form.contentType
                }
                else {
                    contentType = "application/json"
                }
            }

            // define content type of request
            let requestType
            if (form.contentType) {
                requestType = form.contentType
            }
            else {
                requestType = "application/json"
            }

            recognizeMethod(myOp, path, server, contentType, requestType, tags)
        }
    }

    function extractPath(link) {
        let server, path
        if (link.startsWith("http://")) {
            server = "http://" + link.slice(7).split("/").shift()
            path = "/" + link.slice(7).split("/").slice(1).join("/")
        }
        else if (link.startsWith("https://")) {
            server = "https://" + link.slice(8).split("/").shift()
            path = "/" + link.slice(8).split("/").slice(1).join("/")
        }
        else {
            path = link
            if (!path.startsWith("/")) {path = "/" + path}
        }
        return {path, server}
    }

    function recognizeMethod(ops, path, server, contentType, requestType, tags) {
        const mapping = {
            readproperty: "get",
            writeproperty: "put",
            invokeaction: "post",
            readallproperties: "get",
            writeallproperties: "put",
            readmultipleproperties: "get",
            writemultipleproperties: "put"
        }

        const methods = []
        if (typeof ops === "string") {ops = [ops]}
        ops.forEach( op => {
            if(Object.keys(mapping).some( prop => prop === op)) {
                methods.push(mapping[op])
            }
        })

        methods.forEach( method => {
            // check if same method is already there (e.g. as http instead of https version)
            if (cPaths[path][method]) {
                if (server) {
                    if (cPaths[path][method].servers) {
                        cPaths[path][method].servers.push(new Server(server))
                    }
                    else {
                        cPaths[path][method].servers = [new Server(server)]
                    }
                }
            }
            else {
                cPaths[path][method] = {
                    tags,
                    responses: {
                        default: {
                            description: "the default Thing response",
                            content: {
                                [contentType]: {}
                            }
                        }
                    },
                    requestBody: {
                        content: {
                            [requestType]: {}
                        }
                    }
                }
                // check if server is given (ain't the case for "base" url fragments) and add
                if (server) {
                    cPaths[path][method].servers = [new Server(server)]
                }
            }
        })
    }

    return cPaths
}

function crawlServers(base) {
    let cServers = []

    if (base !== undefined) {
        cServers.push(new Server(base, "TD base url"))
    }
    return cServers
}

function addTags(td) {
    const tags = []
    const interactions = {
        properties: {
            name: "property",
            description: "A property can expose a variable of a Thing, this variable might be readable, writable and/or observable.",
            externalDocs: new ExternalDocs("https://www.w3.org/TR/wot-thing-description/#propertyaffordance", "Find out more about Property Affordances.")
        },
        actions: {
            name: "action",
            description: "An action can expose something to be executed by a Thing, an action can be invoked.",
            externalDocs: new ExternalDocs("https://www.w3.org/TR/wot-thing-description/#actionaffordance", "Find out more about Action Affordances.")
        },
        events: {
            name: "event",
            description: "An event can expose a notification by a Thing, this notification can be subscribed and/or unsubscribed.",
            externalDocs: new ExternalDocs("https://www.w3.org/TR/wot-thing-description/#eventaffordance", "Find out more about Event Affordances.")
        }
    }
    Object.keys(interactions).forEach( interactionType => {
        if (td[interactionType] !== undefined) {
            tags.push(interactions[interactionType])
        }
    })
    return tags
}


/* ##### CONSTRUCTORS ############ */
function Server(url, description, variables) {
    if (url === undefined) {throw new Error("url for server object missing")}
    this.url = url
    if (description) {this.description = description}
    if (variables) {this.variables = variables}
}

function ExternalDocs(url, description) {
    if (url === undefined) {throw new Error("url for external docs object missing")}
    this.url = url
    if (description) {this.description = description}
}