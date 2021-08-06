// TOKEN service

const { isEmpty } = require('../../string');
const _data = require('../../data');
const helpers = require('../../helpers');

const user = require('../user');
const { userCollectionName, tokenCollectionName } = require('../constants');

const tokenLength = 20;
const expiresPeriod = 1000 * 60 * 60;
const token = {};
token.verify = (id, phone, callback) => {
	_data.read(tokenCollectionName, id, (err, data) => {
		return callback(!err && phone === data.phone && data.expires > Date.now())
	});
}
// Required data: id
// Optional data: none
token.get = (data, callback) => {
	const { query: { id } } = data;

	const isIdValid = typeof(id) === 'string' && id.trim().length === tokenLength;
	const idValue = isIdValid ? id.trim() : false;

	if (!idValue)
		return callback(
			400,
			{ error : 'Missing required attribute id or its value is not valid' }
		);

	_data.read(tokenCollectionName, idValue, (err, data) => {
		if (err) return callback(404);

		callback(200, data);
	});
}
// Required data: phone
// Optional data: none
token.post = (data, callback) => {
	const { payload } = data;

	const phone = isEmpty(payload.phone) || payload.phone.length !== 10
		? false
		: payload.phone.trim();
	const password = isEmpty(payload.password) ? false : payload.password.trim();

	if (!phone || !password ) return callback(400, { error : 'Missing required attributes' });

	console.log(user.collectionName);

	_data.read(userCollectionName, phone, (err, user = {}) => {
		if (err) return callback(404, { error: 'User not found' });

		const hashedPass = helpers.hash(password);

		if (hashedPass !== user.hashedPass)
			return callback(400, { error : 'Invalid password' });

		const tokenId = helpers.createRandomString(tokenLength);
		const expires = Date.now() + expiresPeriod;

		const tokenObj = {
			id: tokenId,
			expires,
			phone
		};

		_data.create(tokenCollectionName, tokenId, tokenObj, (err) => {
			if (err) return callback(500, { error: 'Error while creating token' });

			callback(200, tokenObj)
		});
	});

}
// Required attributes: id, extend
// Optional data: none
token.put = (data, callback) => {
	const { payload } = data;

	const isIdValid = typeof(payload.id) === 'string'
		&& payload.id.trim().length === tokenLength;
	const id = isIdValid ? payload.id.trim() : false;

	const extend = typeof(payload.extend) === 'boolean' && payload.extend;

	if (!id || !extend) return callback(400, { error : 'Missing required attributes' });

	_data.read(tokenCollectionName, id, (err, data) => {
		if (err) return callback(404);

		if (!(data.expires > Date.now())) return callback(400, { error : 'Token is expired' });

		const newExpires = Date.now() + expiresPeriod;
		_data.update(tokenCollectionName, id, { ...data, expires: newExpires }, (err) => {
			if (err) {
				console.log(err, 'An error while updating token');
				callback(500, err);
			}

			callback(200, { message: 'Token has been extended' });
		})
	});

}
// Required attributes: id
// Optional data: none
token.delete = (data, callback) => {
	const { payload } = data;

	const isIdValid = typeof(payload.id) === 'string'
		&& payload.id.trim().length === tokenLength;
	const id = isIdValid ? payload.id.trim() : false;

	_data.delete(tokenCollectionName, id, (err) => {
		if (err) return callback(404, { error: 'Token not found' });

		callback(200, { message: 'Token has been deleted' });
	});
}

token.collectionName = tokenCollectionName;
module.exports = token;
