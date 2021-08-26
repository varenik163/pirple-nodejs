const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const url = require('url');

const helpers = require('./helpers');
const { checkCollectionName } = require('./handlers/constants');
const { acceptableMethods, acceptableProtocols } = require('./handlers/check');
const _data = require('./data');
const { isEmpty } = require('./string');

const workers = {};

const loopLatency = 1000 * 5;

workers.gatherAllChecks = () => {
	_data.list(checkCollectionName, (err, checkIds) => {
		if (err) return console.log(err);
		checkIds.forEach(checkId => {
			_data.read(checkCollectionName, checkId, (err, check) => {
				if (err) console.log(err);
				workers.validateCheck(check);
			});
		})
	});
};

workers.validateCheck = (check) => {
	const id = typeof(check.id) === 'string';
	const protocol = isEmpty(check.protocol) || !(acceptableProtocols.includes(check.protocol))
		? false
		: check.protocol;
	const url = isEmpty(check.url) ? false : check.url.trim();
	const method = isEmpty(check.method) || !(acceptableMethods.includes(check.method))
		? false
		: check.method;

	if (!(id && protocol && url && method))
		return //console.log('Warning: check is not valid ', check.id, check.url);

	workers.performCheck(check);
};

workers.performCheck = (check) => {
	console.log('Performing check ' + check.id);
	const checkOutcome = {
		error: false,
		responseCode: false
	};

	let outcomeSent = false;

	const parsedUrl = url.parse(check.protocol + '://' + check.url, true);
	const host = parsedUrl.hostname;
	const path = parsedUrl.path;

	const requestDetails = {
		protocol: check.protocol + ':',
		hostname: host,
		meth: check.method.toLocaleUpperCase(),
		path,
		timeout: check.timeoutSeconds * 1000
	};

	const _protocolModule = check.protocol === 'http' ? http : https;
	const req = _protocolModule.request(requestDetails, (response) => {
		checkOutcome.responseCode = response.statusCode;
		console.log('Check req status: ' +  response.statusCode);

		if (!outcomeSent) {
			workers.processCheckOutcome(check, checkOutcome);
			outcomeSent = true;
		}
	});

	req.on('error', (err) => {
		checkOutcome.error = {
			error: true,
			value: err
		};
		if (!outcomeSent) {
			workers.processCheckOutcome(check, checkOutcome);
			outcomeSent = true;
		}
	});

	req.on('timeout', (err) => {
		checkOutcome.error = {
			error: true,
			value: 'timeout'
		};
		if (!outcomeSent) {
			workers.processCheckOutcome(check, checkOutcome);
			outcomeSent = true;
		}
	});

	req.end();
};

workers.processCheckOutcome = (check, checkOutcome) => {
	const state = !checkOutcome.error
		&& checkOutcome.responseCode
		&& check.successCode.includes(checkOutcome.responseCode)
		? 'up' : 'down';

	const alertWarranted = check.lastChecked && check.state !== state;
	const newCheckData = { ...check };

	newCheckData.state = state;
	newCheckData.lastChecked = Date.now();

	_data.update(checkCollectionName, check.id, newCheckData, (err) => {
		if (err) return console.log(err);
		if (alertWarranted) workers.alertUserToStatusChange(newCheckData);
		if (!alertWarranted) console.log('Alert is not needed');
	})
};

workers.alertUserToStatusChange = (newCheckData) => {
	const message = `Your check for ${newCheckData.url} is currently ${newCheckData.state}`;

	helpers.sendTwilioSms(newCheckData.userPhone, message, (res) => {
		console.log('SUCCESS: User alerted via sms message, status ' + res)
	});
};

workers.loop = () => {
	setInterval(() => {
		workers.gatherAllChecks();
	}, loopLatency);
};

workers.init = () => {
	workers.gatherAllChecks();
	workers.loop();
};

module.exports = workers;
