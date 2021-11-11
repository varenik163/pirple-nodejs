// CHECK service

const { isEmpty } = require('../../string');
const _data = require('../../data');
const helpers = require('../../helpers');
const config = require('../../config');

const token = require('../token');
const { userCollectionName, checkCollectionName, tokenCollectionName } = require('../constants');

const checkIdLength = 20;
const check = {};

const acceptableMethods = ['post', 'get', 'put', 'delete'];
const acceptableProtocols = ['http', 'https'];

//Required data: protocol, url, method, successCode, timeoutSeconds
check.post = (data, callback) => {
	const { payload } = data;
	const { token: tokenId } = data.headers;

	const protocol = isEmpty(payload.protocol) || !(acceptableProtocols.includes(payload.protocol))
		? false
		: payload.protocol;
	const url = isEmpty(payload.url) ? false : payload.url.trim();
	const method = isEmpty(payload.method) || !(acceptableMethods.includes(payload.method))
		? false
		: payload.method;
	const successCode = typeof(payload.successCode) === 'object'
	&& payload.successCode instanceof Array
	&& payload.successCode.length
		? payload.successCode
		: false;
	const timeoutSeconds = typeof(payload.timeoutSeconds) === 'number'
	&& payload.timeoutSeconds % 1 === 0
	&& payload.timeoutSeconds <= 5
	&& payload.timeoutSeconds
		? payload.timeoutSeconds
		: false;

	if (!protocol || !url || !method || !successCode || !timeoutSeconds )
		return callback(400, { error : 'Missing required attributes' });

	_data.read(tokenCollectionName, tokenId, (err, data) => {
		if (err || !data) return callback(403);
		if (!(data.expires > Date.now())) return callback(403, { error : 'Token is expired' });

		const userPhone = data.phone;
		_data.read(userCollectionName, userPhone, (err, userData) => {
			if (err) return callback(403);

			const userChecks = userData.check instanceof Array ? userData.check : [];

			if (userChecks.length >= config.maxChecks)
				return callback(400, 'User has maximum checks ' + config.maxChecks);

			const id = helpers.createRandomString(checkIdLength);
			const check = { id, userPhone, protocol, method, successCode, timeoutSeconds, url };

			_data.create(checkCollectionName, id, check, (err) => {
				if (err) return callback(500, { error: err });

				userData.checks = userChecks.concat([id]);

				_data.update(userCollectionName, userPhone, userData, (err) => {
					if (err) return callback(500, { error: err });

					callback(200, check)
				})
			});
		});
	});
};

// Required attributes: id
// Optional data: none
check.get = (data, callback) => {
	const { query: { id } } = data;
	const { token: tokenId } = data.headers;

	const isIdValid = typeof(id) === 'string' && id.trim().length === checkIdLength;
	const idValue = isIdValid ? id.trim() : false;

	if (!idValue)
		return callback(
			400,
			{ error : 'Missing required attribute id or its value is not valid' }
		);

	_data.read(checkCollectionName, idValue, (err, data) => {
		if (err) return callback(404);
		token.verify(tokenId, data.userPhone, isValid => {
			if (!isValid) return callback(403);

			callback(200, data);
		});
	});
};

// Required data: id
// Optional data: protocol, url, method, successCode, timeoutSeconds
check.put = (data, callback) => {
	const { payload } = data;
	const { token: tokenId } = data.headers;

	const isIdValid = typeof(payload.id) === 'string' && payload.id.trim().length === checkIdLength;
	const idValue = isIdValid ? payload.id.trim() : false;

	if (!idValue) return callback(400, { error: 'Missing required attributes' })

	const protocol = isEmpty(payload.protocol) || !(acceptableProtocols.includes(payload.protocol))
		? false
		: payload.protocol;
	const url = isEmpty(payload.url) ? false : payload.url.trim();
	const method = isEmpty(payload.method) || !(acceptableMethods.includes(payload.method))
		? false
		: payload.method;
	const successCode = typeof(payload.successCode) === 'object'
	&& payload.successCode instanceof Array
	&& payload.successCode.length
		? payload.successCode
		: false;
	const timeoutSeconds = typeof(payload.timeoutSeconds) === 'number'
	&& payload.timeoutSeconds % 1 === 0
	&& payload.timeoutSeconds <= 5
	&& payload.timeoutSeconds
		? payload.timeoutSeconds
		: false;

	if (!protocol && !url && !method && !successCode && !timeoutSeconds )
		return callback(400, { error : 'All attributes are empty' });

	_data.read(checkCollectionName, idValue, (err, data) => {
		if (err) return callback(400, { error: 'Check id does not exist' });

		token.verify(tokenId, data.userPhone, isValid => {
			if (!isValid) return callback(403);

			const newData = { ...data };
			if (protocol) newData.protocol = protocol;
			if (url) newData.url = url;
			if (method) newData.method = method;
			if (successCode) newData.successCode = successCode;
			if (timeoutSeconds) newData.timeoutSeconds = timeoutSeconds;
			_data.update(checkCollectionName, idValue, newData, (err) => {
				if (err) return callback(500, { error: 'Error while updating check' });

				return callback(200, { message: 'Check has been updated' });
			})
		});
	});
};

// Required data: id
// Optional data: none
check.delete = (data, callback) => {
	const { payload: { id } } = data;
	const { token: tokenId } = data.headers;

	const isIdValid = typeof(id) === 'string' && id.trim().length === checkIdLength;
	const idValue = isIdValid ? id.trim() : false;

	if (!idValue)
		return callback(
			400,
			{ error : 'Missing required attribute id or its value is not valid' }
		);

	_data.read(checkCollectionName, idValue, (err, data) => {
		if (err) return callback(404);
		token.verify(tokenId, data.userPhone, isValid => {
			if (!isValid) return callback(403);

			_data.delete(checkCollectionName, idValue, (err) => {
				if (err) return callback(500, { error: err });

				_data.read(userCollectionName, data.userPhone, (err, userData) => {
					if (err) return callback(500, {error: err});

					const userChecks = userData.check instanceof Array ? userData.check : [];
					const checkIndex = userChecks.indexOf(idValue);

					if (checkIndex === -1)
						return callback(500, { error: 'There is no check match this user' });

					userChecks.splice(checkIndex, 1);
					userData.check = userChecks;

					_data.update(userCollectionName, data.userPhone, userData, (err) => {
						if (err) return callback(500, {error: err});

						return callback(200, {message: 'Check has been deleted'});
					});
				});
			});
		});
	});
};

check.collectionName = checkCollectionName;
check.acceptableMethods = acceptableMethods;
check.acceptableProtocols = acceptableProtocols;
module.exports = check;
