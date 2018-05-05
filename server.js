'use strict';
var http = require('http');
var dgram = require('dgram');
var port = 1230;

var server = dgram.createSocket('udp4');

//Just declare for now
var registeredPartners = [];

/* registeredPartners = [
 *      {
 *          ip: "127.0.0.1",
 *          port: 80,
 *      },
 *      {
 *          ip: "127.0.0.1",
 *          port: 80,
 *      }
 * ];
 */ 

server.on('message', (msg, rinfo) => {
    //Fist message possibility is a registration into the database
    if (msg == "[REGISTER]") {
        var info = {
            ip: rinfo.ip,
            port: rinfo.port,
        };
        registeredPartners.push(info);
    }
    else if (msg == "[P2P]") {
        //Find a partner
        if (registeredPartners.length <= 1) {
            server.send("[FAIL]", rinfo.port, rinfo.ip);
        } else {
            if (registeredPartners[0].ip != rinfo.ip) {
                server.send("[IP][" + registeredPartners[0].ip + "][PORT][" + registeredPartners[0].port + "]");
            }
            else {
                server.send("[IP][" + registeredPartners[1].ip + "][PORT][" + registeredPartners[1].port + "]");
            }
        }
    }
});

server.bind(port);
