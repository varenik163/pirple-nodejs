const environments = {
	staging: {
		httpPort: 3007,
		httpsPort: 3008,
		envName: 'staging',
		hashSecret: 'hashSecret',
		maxChecks: 5,
		twilio: {
			accountSid: 'AC551567d85ba564fabe57a3f7c4a0c900',
			authToken: '61889773963c2b381f2f9fc78a45ac29',
			fromPhone: '+14014264778'
		},
		templateGlobal: {
			appName: 'Pirple Study Project',
			companyName: 'Pirple',
			yearCreated: '2021',
			baseUrl: 'http://localhost:3007/'
		}
	},
	production: {
		httpPort: 5000,
		httpsPort: 5001,
		envName: 'production',
		hashSecret: 'hashSecret',
		maxChecks: 5,
		twilio: {
			accountSid: 'AC551567d85ba564fabe57a3f7c4a0c900',
			authToken: '61889773963c2b381f2f9fc78a45ac29',
			fromPhone: '+14014264778'
		},
		templateGlobal: {
			appName: 'Pirple Study Project',
			companyName: 'Pirple',
			yearCreated: '2021',
			baseUrl: 'http://localhost:5000/'
		}
	}
};

const currentEnv = typeof(process.env.NODE_ENV) === 'string'
	? process.env.NODE_ENV.toLowerCase() : '';

const envToExport = environments[currentEnv] || environments.staging;

module.exports = envToExport;
