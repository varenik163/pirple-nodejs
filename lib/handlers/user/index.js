const { isEmpty } = require('../../string');
const _data = require('../../data');
const helpers = require('../../helpers');

const token = require('../token');
const { userCollectionName, checkCollectionName } = require('../constants');

// USER service
const user = { collectionName: userCollectionName };
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
user.post = (data, callback) => {
	const { payload } = data;
	const firstName = isEmpty(payload.firstName) ? false : payload.firstName.trim();
	const lastName = isEmpty(payload.lastName) ? false : payload.lastName.trim();
	const phone = isEmpty(payload.phone) || payload.phone.length !== 10
		? false
		: payload.phone.trim();
	const password = isEmpty(payload.password) ? false : payload.password.trim();
	const tosAgreement = typeof(payload.tosAgreement) === 'boolean' && payload.tosAgreement;

	const dataIsValid = firstName && lastName && phone && password && tosAgreement;

	if (!dataIsValid) return callback(
		400,
		{
			error: 'Missing required attributes' ,
			data: {firstName, lastName, phone, password, tosAgreement }
		}
	);

	_data.read(userCollectionName, phone, (err, data) => {
		if (!err) callback(400, { error: 'User already exists' });

		const hashedPass = helpers.hash(password);
		if (!hashedPass) return callback(500, { error: 'Error while hashing user pass' });

		const userData = { firstName, lastName, hashedPass, phone, tosAgreement };

		_data.create(userCollectionName, phone, userData, (err) => {
			if (err) {
				console.log(err, 'An error while creating user');
				callback(500, { error: err });
			}

			callback(200, { message: 'User has been created' });
		});
	});
}

// Required data: phone
// Optional data: none
user.get = (data, callback) => {
	const { query: { phone } } = data;
	const { token: tokenId } = data.headers;

	token.verify(tokenId, phone, isValid => {
		if (!isValid) return callback(403);

		const isPhoneValid = typeof(phone) === 'string' && phone.trim().length === 10;
		const phoneNumber = isPhoneValid ? phone.trim() : false;

		if (!phoneNumber) return callback(400, { error : 'Missing required attribute phone' });

		_data.read(userCollectionName, phoneNumber, (err, data) => {
			if (err) return callback(404);

			delete data.hashedPass;
			callback(200, data);
		});
	})
}

// Required data: phone
// Optional data: firstName, lastName, password
user.put = (data, callback) => {
	const { payload: user } = data;
	const { token: tokenId } = data.headers;

	token.verify(tokenId, user.phone, isValid => {
		if (!isValid) return callback(403);

		const firstName = isEmpty(user.firstName) ? false : user.firstName.trim();
		const lastName = isEmpty(user.lastName) ? false : user.lastName.trim();
		const phone = isEmpty(user.phone) || user.phone.length !== 10
			? false
			: user.phone.trim();
		const password = isEmpty(user.password) ? false : user.password.trim();

		if (!phone ) return callback(400, { error : 'Missing phone' });

		const userData = {};
		if (firstName) userData.firstName = firstName;
		if (lastName) userData.lastName = lastName;
		if (password) userData.hashedPass = helpers.hash(password);

		if (Object.keys(userData).length === 0) return callback(400, { error: "Nothing to update" });


		_data.read(userCollectionName, phone, (err, data = {}) => {
			if (err) return callback(404);

			_data.update(userCollectionName, phone, { ...data, ...userData }, (err) => {
				if (err) {
					console.log(err, 'An error while updating user');
					callback(500, err);
				}

				callback(200, { message: 'User has been updated' });
			});
		});
	});
}
user.delete = (data, callback) => {
	const { payload } = data;
	const { token: tokenId } = data.headers;

	token.verify(tokenId, payload.phone, isValid => {
		if (!isValid) return callback(403);
		const phone = isEmpty(payload.phone) || payload.phone.length !== 10
			? false
			: payload.phone.trim();
		if (!phone) return callback(400, { error : 'Missing required attribute "phone"' });

		_data.read(userCollectionName, phone, (err, user) => {
			if (err) return callback(404, { error: 'User not found' });

			_data.delete(userCollectionName, phone, (err) => {
				if (err) return callback(404, { error: 'User not found' });
				const userChecks = user.check instanceof Array ? user.check : [];

				if (!userChecks.length) return callback(200, { message: 'User has been deleted without checks' });

				let errorIs = false;

				userChecks.forEach((checkId, i) => {
					_data.delete(checkCollectionName, checkId, (err) => {
						if (err) errorIs = true;
						if (i === userChecks.length - 1) {
							if (errorIs)
								return callback (500, { error: 'There was an error while deleting users checks' });
							return callback(200, { message: 'User has been deleted' });
						}
					});
				});
			});
		});
	});
}

module.exports = user;
