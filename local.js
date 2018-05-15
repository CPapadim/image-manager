const exec = require('child_process').exec; // For Async execution
const execSync = require('child_process').execSync;

var dockerode  = require('dockerode');
var utils = require('./utils.js');


function getContainerList() {
	// Get the list of containers on the local machine

	try {
		if (utils.isWindows()) {
			var docker = new dockerode({socketPath: '//./pipe/docker_engine'});
		} else {
			var docker = new dockerode({socketPath: '/var/run/docker.sock'});
		}
	} catch (error) {
		throw new Error('Cannot connect to the Docker daemon. Is the daemon running?');
	}

 	return new Promise((resolve, reject)=> {
		docker.listContainers({all: true}, function (err, containers) {
			if(err) {
				reject(err);
			} else {
				 var container_array = [];
				containers.forEach(function (containerInfo) {
					container_array.push(containerInfo);
			  	});
			  	resolve(container_array);
			}
		});
	});
}


function getImageList(filter) {

	try {
		if (utils.isWindows()) {
			var docker = new dockerode({socketPath: '//./pipe/docker_engine'});
		} else {
			var docker = new dockerode({socketPath: '/var/run/docker.sock'});
		}
	} catch (error) {
		throw new Error('Cannot connect to the Docker daemon. Is the daemon running?');
	}

 	return new Promise((resolve, reject)=> {
		docker.listImages({filter: filter}, function (err, images) {
			if(err) {
				reject(err);
			} else {
				 var image_array = [];
				images.forEach(function (imageInfo) {
					image_array.push(imageInfo);
			  	});
			  	resolve(image_array);
			}
		});
	});	
}


function getImageData(name) { 
	// get data for a given image name

	try {
		if (utils.isWindows()) {
			var docker = new dockerode({socketPath: '//./pipe/docker_engine'});
		} else {
			var docker = new dockerode({socketPath: '/var/run/docker.sock'});
		}
	} catch (error) {
		throw new Error('Cannot connect to the Docker daemon. Is the daemon running?');
	}
	var image = docker.getImage(name);
	return image.inspect();
}


function startContainer(container_id) {
	try {
		if (utils.isWindows()) {
			var docker = new dockerode({socketPath: '//./pipe/docker_engine'});
		} else {
			var docker = new dockerode({socketPath: '/var/run/docker.sock'});
		}
	} catch (error) {
		throw new Error('Cannot connect to the Docker daemon. Is the daemon running?');
	}
	var container = docker.getContainer(container_id);
	container.start(function (err, data) {
		if(err) {alert(err);}
	 	console.log(data);
	});
}

function stopContainer(container_id) {
	try {
		if (utils.isWindows()) {
			var docker = new dockerode({socketPath: '//./pipe/docker_engine'});
		} else {
			var docker = new dockerode({socketPath: '/var/run/docker.sock'});
		}
	} catch (error) {
		throw new Error('Cannot connect to the Docker daemon. Is the daemon running?');
	}
	var container = docker.getContainer(container_id);
	container.stop(function (err, data) {
		if(err) {alert(err);}
	 	console.log(data);
	});
}

function createContainer(image_name, config_file) {
	console.log(image_name);
	try {
		if (utils.isWindows()) {
			var docker = new dockerode({socketPath: '//./pipe/docker_engine'});
		} else {
			var docker = new dockerode({socketPath: '/var/run/docker.sock'});
		}
	} catch (error) {
		throw new Error('Cannot connect to the Docker daemon. Is the daemon running?');
	}

	var options = { Binds: ['/var/run/docker.sock:/var/run/docker.sock', '/opt/app:/home/mysource'] }

	docker.run(image_name, [], process.stdout, options, function(err, data, container) {
  		//console.log(data.StatusCode);
	});
	//console.log(config_file);
}

module.exports.getContainerList = getContainerList;
module.exports.getImageData = getImageData;
module.exports.getImageList = getImageList;
module.exports.startContainer = startContainer;
module.exports.stopContainer = stopContainer;
module.exports.createContainer = createContainer;