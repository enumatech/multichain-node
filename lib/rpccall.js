"use strict";

const rpc = require('json-rpc2');
const commands = require("./commands");

module.exports = (connection) => {
    if(!connection){
        throw "Must include IP and Port to connect."
    }

    let client = rpc.Client.$create(connection.port, connection.address, connection.user, connection.pass);
    let caller = {};

    for(let command in commands){

        caller[command] = (args, cb) => {

            let params;

            if (args instanceof Object && !(args instanceof Array) && !(args instanceof Function)){

                params = parseParams(commands[command], args);

            } else if (args instanceof Function && !cb){

                cb = args;

            } else {

                params = args;

            }

            client.call(command.toLowerCase(), params, (err, res) => {

                if (err){
                    return cb(JSON.parse(err.message.substr(5, err.message.length)))
                }

                cb(null, res);
            })
        }
    }
    return caller;
}

let parseParams = (commandParams, args) => {
    let userParams = [];

    for(let arg of commandParams){

        if(typeof arg === "string") {

            userParams.push(args[arg]);

        } else if (typeof arg === "object") {

            let key = Object.keys(arg)[0];
            let defaultVal = arg[key];

            if(typeof args[key] !== "undefined") {

                userParams.push(args[key]);

            } else {

                userParams.push(defaultVal);

            }
        }
    }
    
    return userParams;
}