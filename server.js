'use strict';
const http = require('http');
const dgram = require('dgram');
const url = require('url');
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

//Handle requests for RESTful API
var http_server = http.createServer(function (request, response) {

    //Process URL here

    //So url is valid
    request.url = "http://www.google.com" + request.url;

    var RespURL = new url.URL(request.url);

    var paths = RespURL.pathname.split('/');

    //String.Split is horribly broken; naturally
    for (var i = 0; i < paths.length; i++) {
        if (paths[i] == "") {
            paths.splice(i,1);
        }
    }

    if (paths.length < 2) {
        response.writeHead(400, { 'Content-Type': 'text/plain' });
        response.write("400");
        response.end();
        return;
    }

    if (paths[0] == "v1")
        handleV1Request(RespURL, paths, request, response)
    else {
        response.writeHead(400, { 'Content-Type': 'text/plain' });
        response.write("400");
        response.end();
    }

});

/*
 * Handle V1 requests here
 */ 
function handleV1Request(Url, params, request, response) {
    /*
     * GetPartner response structure
     * {
     *      ip: "127.0.0.1",
     *      port: 80,
     * }
     */ 
    if (params[1] == "GetPartner") {
        if (registeredPartners.length > 0) {
            response.writeHead(200, { 'Content-Type': 'text/plain' });
            response.write('{ ip:' + registeredPartners[0].ip + ', port:' + registeredPartners[0].port + ', }');
            response.end();
        }
        else {
            response.writeHead(500, { 'Content-Type': 'text/plain' });
            response.end("500");
        }
    }

    /*
     * RegisterAsPartner response params
     * ?ip=ip&port=port
     * 
     */
    else if (params[1] == "RegisterAsPartner") {
        var ip = Url.searchParams.get('ip');
        var port = Url.searchParams.get('port');
        if (!Url.searchParams.has('ip') || !Url.searchParams.has('port')) {
            response.writeHead(400, { 'Content-Type': 'text/plain' });
            response.end("400");
            return;
        }

        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.write('{ ip:' + ip + ', port:' + port + ', }');
        registeredPartners.push({
            ip: ip,
            port: port,
        });
        response.end();
    }

    /*
     * HasPartner response
     * 
     * {
     *      partner: true/false,
     * }
     */

    else if (params[1] == "HasPartner") {
        if (registeredPartners.length > 0) {
            response.writeHead(200, { 'Content-Type': 'text/plain' });
            response.write('{ partner: true }');
            response.end();
        } else {
            response.writeHead(200, { 'Content-Type': 'text/plain' });
            response.write('{partner: false }');
            response.end();
        }
    }

    else if (params[1] == "IsBerryCool") {
        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.write('Hell yes! Best person ever!');
        response.end();
    }
    
    /*
     * In the event of bad requests
     */ 
    else {
        response.writeHead(404, { 'Content-Type': 'text/plain' });
        response.write('404');
        response.end();
    }
}

http_server.listen(80);

server.bind(port);
