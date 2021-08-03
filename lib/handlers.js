// Handlers

const { isEmpty } = require('./string');
const _data = require('./data');
const helpers = require('./helpers');

const acceptableMethods = ['post', 'get', 'put', 'delete'];

const user = {
	// Required data: firstName, lastName, phone, password, tosAgreement
	// Optional data: none
	post: (data, callback) => {
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

		_data.read('users', phone, (err, data) => {
			if (!err) callback(400, { error: 'User already exists' });

			const hashedPass = helpers.hash(password);
			if (!hashedPass) return callback(500, { error: 'Error while hashing user pass' });

			const userData = { firstName, lastName, hashedPass, phone, tosAgreement };

			_data.create('users', phone, userData, (err) => {
				if (err) {
					console.log(err, 'An error while creating user');
					callback(500, err);
				}

				callback(200, { message: 'User has been created' });
			});
		});
	},

	// Required data: phone
	// Optional data: none
	get: (data, callback) => {
		const { query: { phone } } = data;

		const isPhoneValid = typeof(phone) === 'string' && phone.trim().length === 10;
		const phoneNumber = isPhoneValid ? phone.trim() : false;

		if (!phoneNumber) return callback(400, { error : 'Missing required attribute phone' });

		_data.read('users', phoneNumber, (err, data) => {
			if (err) return callback(404);

			delete data.hashedPass;
			callback(200, data);
		});
	},

	// Required data: phone
	// Optional data: firstName, lastName, password
	put: (data, callback) => {
		const { payload: user } = data;

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

		console.log(userData)
		if (Object.keys(userData).length === 0) return callback(400, { error: "Nothing to update" });


		_data.read('users', phone, (err, data = {}) => {
			if (err) return callback(404);

			_data.update('users', phone, { ...data, ...userData }, (err) => {
				if (err) {
					console.log(err, 'An error while updating user');
					callback(500, err);
				}

				callback(200, { message: 'User has been updated' });
			});
		});
	},
	delete: (data, callback) => {
		const { payload: user } = data;
		const phone = isEmpty(user.phone) || user.phone.length !== 10
			? false
			: user.phone.trim();

		if (!phone) return callback(400, { error : 'Missing required attribute "phone"' });

		_data.delete('users', phone, (err) => {
			if (err) return callback(404, { error: 'User not found' });

			callback(200, { message: 'User has been deleted' });
		});
	},
};

const token = {
	get: (data, callback) => {},
	post: (data, callback) => {
		const { payload } = data;

		const phone = isEmpty(payload.phone) || payload.phone.length !== 10
			? false
			: payload.phone.trim();
		const password = isEmpty(payload.password) ? false : payload.password.trim();

		if (!phone || !password ) return callback(400, { error : 'Missing required attributes' });

		_data.read('users', phone, (err, user = {}) => {
			if (err) return callback(404, { error: 'User not found' });

			const hashedPass = helpers.hash(password);

			if (hashedPass !== user.hashedPass)
				return callback(400, { error : 'Invalid password' });

			const tokenId = helpers.createRandomString(80);
			const expires = Date.now() + 1000 * 60 * 60;

			const tokenObj = {
				id: tokenId,
				expires,
				phone
			};

			_data.create('tokens', tokenId, tokenObj, (err) => {
				if (err) return callback(500, 'Error while creating token');

				callback(200, tokenObj)
			});
		});

	},
	put: (data, callback) => {},
	delete: (data, callback) => {}
};

const handlers = {
	user: (data, callback) => {
		const method = data.method.toLowerCase();
		if (!acceptableMethods.includes(method)) return callback(405);

		user[method](data, callback);
	},
	token: (data, callback) => {
		const method = data.method.toLowerCase();
		if (!acceptableMethods.includes(method)) return callback(405);

		token[method](data, callback);
	},
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

module.exports = handlers;
