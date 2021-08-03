const crypto = require('crypto');

const config = require('../config');
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

const helpers = {
	hash,
	createRandomString
}

module.exports = helpers;
