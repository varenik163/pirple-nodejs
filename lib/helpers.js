const crypto = require('crypto');
const querystring = require('querystring');
const https = require('https');

const config = require('./config');
const { isEmpty } = require('./string');

// SHA256
const hash = (str) => {
	if (isEmpty(str)) return false;
	return crypto.createHmac('sha256', config.hashSecret)
		.update(str)
		.digest('hex');
};

const createRandomString = (size) => {
	if (!size) return false;

	const possibleChars = 'abcdefghijklmnopqrstuvwxyz1234567890';

	let result = '';
	for(let i  = 0; i < size; i++) {
		const randomCharIndex = Math.floor(Math.random() * possibleChars.length);
		const randomChar = possibleChars.charAt(randomCharIndex);

		result += randomChar;
	}

	return result;
}

const sendTwilioSms = (phone, message, callback) => {
	if (typeof (phone) !== 'string')
		return callback('Phone is invalid');

	if ((typeof (message) !== 'string') || message.length > 100 || message.length === 0)
		return callback('Message is invalid');

	const payload = {
		From: config.twilio.fromPhone,
		To: phone,
		Body: message
	};

	const payloadStr = querystring.stringify(payload);
	const params = {
		protocol: 'https:',
		hostname: 'api.twilio.com',
		method: 'POST',
		path: '/2010-04-01/Accounts/' + config.twilio.accountSid + '/Messages.json',
		auth: config.twilio.accountSid  + ':' + config.twilio.authToken,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(payloadStr)
		}
	};

	const req = https.request(params, (res) => {
		if (res.ststusCode === 200 || res.ststusCode === 201) return callback(false);
		return callback(res.statusCode);
	});

	req.on('error', e => callback(`twilio message ${e}`));
	req.write(payloadStr);
	req.end();
};

const helpers = {
	hash,
	createRandomString,
	sendTwilioSms
}

module.exports = helpers;
