const environments = {
	staging: {
		httpPort: 3007,
		httpsPort: 3008,
		envName: 'staging'
	},
	production: {
		httpPort: 5000,
		httpsPort: 5001,
		envName: 'production'
	}
};

const currentEnv = typeof(process.env.NODE_ENV) === 'string'
	? process.env.NODE_ENV.toLowerCase() : '';

const envToExport = environments[currentEnv] || environments.staging;

module.exports = envToExport;
