const fs = require('fs');
const path = require('path');

const lib = {
	baseDir: path.join(__dirname, '/../.data'),
	create: (dir, file, data, callback = err => console.log(err)) => {
		fs.open(
			`${lib.baseDir}/${dir}/${file}.json`,
			'wx',
			(err, fileDescriptor) => {
				if (err) return callback(err);
				if (!fileDescriptor) return callback("fileDescriptor is not set");

				const stringData = JSON.stringify(data);
				fs.writeFile(fileDescriptor, stringData, (err) => {
					fs.close(fileDescriptor, err => callback(err));
				})
			}
		);
	}
};

module.exports = lib;
