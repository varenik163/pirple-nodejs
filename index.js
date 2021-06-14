const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const { StringDecoder } = require('string_decoder');

const config = require('./config');
const _data = require('./lib/data');

// Test
// @TODO remove this
_data.create('test', 'newFile', {'ads': 'dasdas'})

const { httpPort, httpsPort } = config;

const server = (req, res) => {
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
		const chosenHandler = router[trimmedPath] || router.notFound;
		const data = {
			trimmedPath,
			query,
			method,
			headers,
			payload: buffer
		};
		chosenHandler(data, (statusCode = 200, payload = {}) => {
			const payloadString = JSON.stringify(payload);
			res.setHeader('Content-Type', 'application/json')
			res.writeHead(statusCode);
			res.end(payloadString);
			console.log(
				'Returning this response: ',
				statusCode,
				payloadString
			)
		});
	});
}
const httpServer = http.createServer((req, res) => {
	server(req, res);
});

httpServer.listen(httpPort, () => {
	console.log(
		`The server is listening on port ${httpPort}`
	);
});

const httpsServerOptions = {
	'key': fs.readFileSync('./https/key.pem'),
	'cert': fs.readFileSync('./https/cert.pem'),
};
const httpsServer = https.createServer(httpsServerOptions,(req, res) => {
	server(req, res);
});

httpsServer.listen(httpsPort, () => {
	console.log(
		`The server is listening on port ${httpsPort}`
	);
});

// Handlers

const handlers = {
	ping: (data, callback) => {
		callback(200);
	},
	hello: (data, callback) => {
		callback(200, { message: 'You are Welcome!' });
	},
	notFound: (data, callback) => {
		callback(404);
	}
};

const router = {
	'ping': handlers.ping,
	'hello': handlers.hello,
	'notFound': handlers.notFound,
}
