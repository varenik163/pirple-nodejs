// Handlers

const user = require('./user');
const token = require('./token');
const check = require('./check');

const acceptableMethods = ['post', 'get', 'put', 'delete'];


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
	check: (data, callback) => {
		const method = data.method.toLowerCase();
		if (!acceptableMethods.includes(method)) return callback(405);

		check[method](data, callback);
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
