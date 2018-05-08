const exec = require('child_process').exec; // For Async execution
const execSync = require('child_process').execSync;

var dockerode  = require('dockerode');
var utils = require('./utils.js');




/*getContainerByName(name) {
    // filter by name
    var opts = {
      "limit": 1,
      "filters": `{"name": ["${name}"]}`
    }

    return new Promise((resolve, reject)=>{
      this.dockerode.listContainers(opts, function(err, containers) {
        if(err) {
          reject(err)
        } else{
          resolve(containers && containers[0])
        }
      });
    })
  }*/

function getContainerList() {

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
					container_array.push(containerInfo.Id);
			  	});
			  	resolve(container_array);
			}
		});
	});


    //console.log(containers);
    //return containers;
}

module.exports.getContainerList = getContainerList;