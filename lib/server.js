const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');
const { StringDecoder } = require('string_decoder');
const util = require('util');

const config = require('./config');
const handlers = require('./handlers');
const helpers = require('./helpers');

const debug = util.debuglog('server');

const serverModel = {};

// Test
// @TODO remove this
// _data.create('test', 'newFile.json', { 0: "create test" });
// _data.read('test', 'newFile.json', (err, data) => { console.log(err, data) });
// _data.update('test', 'newFile.json', { 1: "update test" });
// _data.delete('test', 'newFile.json');

/*helpers.sendTwilioSms(
	'+79179467255',
	"Server is up",
	(res) => console.log('Server up message status in twilio ' + res)
);*/

const { httpPort, httpsPort } = config;

serverModel.server = (req, res) => {
	// Get the URL and parse it
	const parsedUrl = url.parse(req.url, true);

	// regular expression to trim slashes
	const trimRegExp = /^\/+|\/+$/g;

	// Get the path
	const path = parsedUrl.pathname;
	const trimmedPath = path.replace(trimRegExp, '');

	//Get query string as an object
	const { query } = parsedUrl;

	// req destructure
	const { method, headers } = req;

	// Get the payload, if any
	const decoder = new StringDecoder('utf-8');
	let buffer = '';
	req.on('data', data => {
		buffer += decoder.write(data)
	});
	req.on('end', () => {
		buffer += decoder.end();
		const chosenHandler = serverModel.router[trimmedPath] || serverModel.router.notFound;
		const data = {
			trimmedPath,
			query,
			method,
			headers,
			payload: buffer && JSON.parse(buffer)
		};
		chosenHandler(data, (statusCode = 200, payload = {}) => {
			const payloadString = JSON.stringify(payload);
			res.setHeader('Content-Type', 'application/json')
			res.writeHead(statusCode);
			res.end(payloadString);

			if(statusCode === 200) {
				debug('\x1b[32m%s\x1b[0m', `${method.toUpperCase()} /${trimmedPath} ${statusCode}`);
			} else {
				debug('\x1b[31m%s\x1b[0m', `${method.toUpperCase()} /${trimmedPath} ${statusCode}`);
			}
			console.log(
				'Returning this response: ',
				statusCode,
				payloadString
			)
		});
	});
}

serverModel.httpServer = http.createServer((req, res) => {
	serverModel.server(req, res);
});

serverModel.httpsServerOptions = {
	'key': fs.readFileSync(path.join(__dirname, '../https/key.pem')),
	'cert': fs.readFileSync(path.join(__dirname, '../https/cert.pem')),
};
serverModel.httpsServer = https.createServer(serverModel.httpsServerOptions,(req, res) => {
	serverModel.server(req, res);
});

serverModel.router = {
	'user': handlers.user,
	'token': handlers.token,
	'check': handlers.check,
	// funny services
	'ping': handlers.ping,
	'hello': handlers.hello,
	'notFound': handlers.notFound,
}

serverModel.init = () => {
	serverModel.httpServer.listen(httpPort, () => {
		console.log(
			'\x1b[36m%s\x1b[0m',
			`The server is listening on port ${httpPort}`
		);
	});
	serverModel.httpsServer.listen(httpsPort, () => {
		console.log(
			'\x1b[35m%s\x1b[0m',
			`The server is listening on port ${httpsPort}`
		);
	});
};

module.exports = serverModel;
