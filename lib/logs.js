const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const logs = {};
logs.baseDir = path.join(__dirname, '../.logs/');

logs.append = (fileName, text, callback) => {
	fs.open(logs.baseDir + fileName + '.log', 'a', (err, fileDescriptor) => {
		if (err || !fileDescriptor) return callback(err);
		fs.appendFile(fileDescriptor, text + '\n', (err) => {
			if (err) return callback(err);
			fs.close(fileDescriptor, err => {
				if (err) return console.log(err);
				callback(false);
			});
		});
	})
};

logs.list = (includedCompressedLogs, callback) => {
	fs.readdir(logs.baseDir, (err, data) => {
		if (err) return callback(err, data);

		const trimmedFileNames = [];
		data.forEach(fileName => {
			if (fileName.includes('.log'))
				trimmedFileNames.push(fileName.replace('.log', ''));
			if (fileName.includes('.gz.b64') && includedCompressedLogs)
				trimmedFileNames.push(fileName.replace('.gz.b64', ''));
		});
		callback(false, trimmedFileNames);
	});
}

logs.compress = (logId, newFileName, callback) => {
	const sourceFile = logId + '.log';
	const destFile = newFileName + '.gz.b64';

	fs.readFile(logs.baseDir + sourceFile, 'utf8', (err, inputString) => {
		if (err) return callback(err);
		zlib.gzip(inputString, (err, buffer) => {
			if (err || !buffer) return callback(err);
			fs.open(logs.baseDir + destFile, 'wx', (err, fileDescriptor) => {
				if (!fileDescriptor) return callback("fileDescriptor is not set");
				fs.writeFile(fileDescriptor, buffer.toString('base64'), (err) => {
					if (err) return callback(err);
					fs.close(fileDescriptor,(err) => {
						if (err) return callback(err);
						callback(false);
					});
				});
			});
		});
	});
}

logs.decompress = (fileId, callback) => {
	const fileName = fileId + '.gz.b64';
	fs.readFile(logs.baseDir + fileName, 'utf8', (err, str) => {
		if (err || !str) return callback(err);
		const inputBuffer = Buffer.from(str, 'base64');
		zlib.unzip(inputBuffer, (err, outputBuffer) => {
			if (err || !outputBuffer) return callback(err);
			const newStr = outputBuffer.toString();
			callback(false, newStr);
		});
	});
}

logs.truncate = (logId, callback) => {
	fs.truncate(logs.baseDir + logId + '.log',0, (err) => {
		if (err) return callback(err);
		callback(false);
	});
}

module.exports = logs;
