const crypto = require('crypto');
const querystring = require('querystring');
const https = require('https');
const fs = require('fs');
const path = require('path');

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
};

helpers.getStaticAsset = (fileName, callback) => {
  if (!fileName) return callback('fileName is required in getStaticAsset');

  const publicDir = path.join(__dirname, '../public/');
  fs.readFile(
    `${publicDir}${fileName}`,
    (err, data) => {
      if (err) return callback(err);
      callback(false, data)
    }
  );
};

helpers.getTemplate = (templateName, data, callback) => {
	if (!templateName) return callback('Template name is required');

	const templateDir = path.join(__dirname, '../templates/');
	fs.readFile(
		`${templateDir}${templateName}.html`,
		'utf8',
		(err, template) => {
			if (err) return callback(err);
			const final = helpers.interpolate(template, data);
			callback(err, final)
		}
	);
};

helpers.addUniversalTemplates = (template, data, callback) => {
	helpers.getTemplate('_header', data, (err, headerTemplate) => {
		if (err) return callback(err);
		helpers.getTemplate('_footer', data, (err, footerTemplate) => {
			if (err) return callback(err);
			callback(false, headerTemplate + template + footerTemplate);
		});
	});
};

helpers.interpolate = (str, data) => {
	for (key in config.templateGlobal) {
		if (config.templateGlobal.hasOwnProperty(key)) {
			data['global.' + key] = config.templateGlobal[key];
		}
	}

	for (key in data) {
		if (data.hasOwnProperty(key)) {
			data['global.' + key] = config.templateGlobal[key];
			const replace = data[key];
			const find = `{${key}}`;

			str = str.replace(find, replace);
		}
	}
	return str;
};

module.exports = helpers;
