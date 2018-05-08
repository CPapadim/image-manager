function isWindows() {
	return process.platform === 'win32';
};

function isLinux() {
    return process.platform === 'linux';
};

module.exports.isWindows = isWindows;
module.exports.isLinux = isLinux;