const exec = require('child_process').exec; // For Async execution
const execSync = require('child_process').execSync;


function getDockerLogin() {
    try {
        var result = execSync("aws ecr get-login --no-include-email --region us-east-1"); 
    } 
    catch (error) {
        console.log(error.status);  // Might be 127 in your example.
        console.log(error.message); // Holds the message you typically want.
        console.log(error.stderr.toString());  // Holds the stderr output. Use `.toString()`.
        console.log(error.stdout.toString());  // Holds the stdout output. Use `.toString()`.
    }

    console.log(result.toString());
    return result.toString();
}

function ecrLogin() {

    var docker_login = getDockerLogin()
    try {
        var result = execSync(docker_login);
    }
    catch (error) {
        console.log(error.status);  // Might be 127 in your example.
        console.log(error.message); // Holds the message you typically want.
        console.log(error.stderr.toString());  // Holds the stderr output. Use `.toString()`.
        console.log(error.stdout.toString());  // Holds the stdout output. Use `.toString()`.
    }

    aws_account_id = docker_login.split('//').pop().split('.dkr.ecr').shift(); 
    aws_account_region = docker_login.split('.dkr.ecr.').pop().split('.amazonaws').shift();

    console.log(aws_account_id, aws_account_region);
    console.log(result.toString());

    return {"id": aws_account_id, "region": aws_account_region};
}



function getRepositoryList() {
    try {
        var result =  execSync("aws ecr describe-repositories --no-paginate"); 
    } 
    catch (error) {
        console.log(error.status);  // Might be 127 in your example.
        console.log(error.message); // Holds the message you typically want.
        console.log(error.stderr.toString());  // Holds the stderr output. Use `.toString()`.
        console.log(error.stdout.toString());  // Holds the stdout output. Use `.toString()`.
    }

    var repositories = JSON.parse(result)['repositories'];

    return repositories;
}

function getFilteredRepositoryList(filter) {

    var repositories = getRepositoryList();

    var filteredRepositories = [];

    for (const key of Object.keys(repositories)) {

        var repositoryName = repositories[key]['repositoryName']

        if (!filter || filter=='' || repositoryName.includes(filter)) {
            filteredRepositories.push(repositoryName);
        }
    };
    return filteredRepositories;
}


function getImageList(repository) {
    
    try {
        var result = execSync("aws ecr describe-images --no-paginate --repository-name " + repository); 
    } 
    catch (error) {
        console.log(error.status);  // Might be 127 in your example.
        console.log(error.message); // Holds the message you typically want.
        console.log(error.stderr.toString());  // Holds the stderr output. Use `.toString()`.
        console.log(error.stdout.toString());  // Holds the stdout output. Use `.toString()`.
    }

    var images = JSON.parse(result);
    return images;
}

function getReposAndImages(filter) {

    ecrLogin();

    var repo_images = [];
    var repositories = getFilteredRepositoryList(filter);

    for (repository of repositories) {
        var repo_data = {"repositoryName": repository, "imageDetails": getImageList(repository)["imageDetails"]};
        repo_images.push(repo_data);
    };

    return repo_images;
}



function pullImage(repository, digest) {
    console.log(repository, digest);
    aws_account = ecrLogin();

    var pullCmd = "docker pull " + aws_account["id"] + ".dkr.ecr." + aws_account["region"] + ".amazonaws.com/" + repository + "\@" + digest
    console.log(pullCmd);
    execSync(pullCmd);
    

}
// Exports
module.exports.getReposAndImages = getReposAndImages;
module.exports.pullImage = pullImage;
