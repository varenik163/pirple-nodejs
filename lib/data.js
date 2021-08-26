const fs = require('fs');
const path = require('path');

const createFile = (dir, file, data, callback = err => console.log(err)) => {
	fs.open(
		`${lib.baseDir}${dir}/${file}`,
		'wx',
		(err, fileDescriptor) => {
			if (err) return callback(err);
			if (!fileDescriptor) return callback("fileDescriptor is not set");

			const stringData = JSON.stringify(data);

			fs.writeFile(fileDescriptor, stringData, (err) => {
				fs.close(fileDescriptor, err => callback(err));
			});
		}
	);
}

const readFile = (dir, file, callback = err => console.log(err)) => {
	fs.readFile(
		`${lib.baseDir}${dir}/${file}`,
		'utf8',
		(err, data) => {

			callback(err, data && JSON.parse(data))
		}
	);
}

const updateFile = (dir, file, data, callback = err => console.log(err)) => {
	fs.open(
		`${lib.baseDir}${dir}/${file}`,
		'r+',
		(err, fileDescriptor) => {
			if (err) return callback(err);
			if (!fileDescriptor) return callback("fileDescriptor is not set");

			const stringData = JSON.stringify(data);

			fs.truncate(fileDescriptor, (err) => {
				if (err) return callback(err);
				fs.writeFile(fileDescriptor, stringData, (err) => {
					fs.close(fileDescriptor, err => callback(err));
				});
			});
		}
	);
}

const deleteFile = (dir, file, callback = err => console.log(err)) => {
	fs.unlink(
		`${lib.baseDir}${dir}/${file}`,
		(err) => {
			callback(err)
		}
	);
}

const list = (dir, callback) => {
	fs.readdir(lib.baseDir + dir + '/', (err, data) => {
		if (err) return callback(err);
		return callback(false, data?.reduce(
			(acc, e) => acc.concat([e.replace('.json', '')])
			, []));
	})
};

const lib = {
	baseDir: path.join(__dirname, '/../.data/'),
	create: createFile,
	read: readFile,
	update: updateFile,
	delete: deleteFile,
	list
};

module.exports = lib;
