/*
*
* Test runner
*
* */

// Dependencies

const helpers = require('./../lib/helpers');
const assert = require('assert');

// logic for test runner

_app = {};

// Container for the tests

_app.tests = {
	unit: {}
};

// getANumber returns a number

_app.tests.unit['helpers.getANumber should return number'] = (done) => {
	const val = helpers.getANumber();
	assert.strictEqual(typeof val, 'number');
	done();
};

// getANumber returns 1

_app.tests.unit['helpers.getANumber should return 1'] = (done) => {
	const val = helpers.getANumber();
	assert.strictEqual(val, 1);
	done();
};

// getANumber returns 2

_app.tests.unit['helpers.getANumber should return 2'] = (done) => {
	const val = helpers.getANumber();
	assert.strictEqual(val, 2);
	done();
};

_app.countTests = () => {
	let counter = 0;

	Object.values(_app.tests).forEach(subTests => {
		counter += Object.values(subTests).length;
	});

	return counter;
};

_app.produceTestReport = (limit, successes, errors) => {
	console.log("");
	console.log("------------BEGIN TEST REPOST-------------");
	console.log("");
	console.log("Total test: ", limit);
	console.log("Success: ", successes);
	console.log("Errors: ", errors.length);
	console.log("");

	// errors details
	if (errors.length) {
		errors.forEach(error => {
			console.log('\x1b[31m%s\x1b[0m', error.name);
			console.log(error.error)
		})
	}

	console.log("");
	console.log("------------END TEST REPOST-------------");
};

_app.runTests = () => {
	const errors = [];
	let successes = 0;
	let counter = 0;
	const limit = _app.countTests();

	Object.values(_app.tests).forEach(subTests => Object.keys(subTests)
		.forEach(testName => {
			(function(){
				const tmpTestName = testName;
				const testValue = subTests[tmpTestName]
				// Call the test
				try {
					testValue(() => {
						console.log('\x1b[32m%s\x1b[0m', tmpTestName);
						counter++;
						successes++;
						if (counter === limit) {
							_app.produceTestReport(limit, success, errors);
						}
					});
				} catch (error) {
					errors.push({
						name: testName,
						error
					});
					console.log('\x1b[31m%s\x1b[0m', tmpTestName);
					counter++;
					if (counter === limit) {
						_app.produceTestReport(limit, successes, errors);
					}
				}
			})();
		})
	);
};

_app.runTests();
