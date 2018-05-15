var registry = require('./registry.js');
var local = require('./local.js');
var fs = require('fs');

function repoFormatter(repo_data, repo_idx) {

	// Format ECR image repo display
	var template = '<div class = "repository selectbox selectbox-' + repo_idx + '">';

	for (let [index, image] of repo_data["imageDetails"].entries()) {

		// Grab the image tags
		var tags_template = '';

		tags_template += '<div class = "image-tags">';
		if (image["imageTags"]) {
			for (tag of image["imageTags"]) {
				tags_template += '<div class = "image-tag">' + tag + '</div>';
			}
		}
		tags_template += '</div>';

		// Grab the creation date
		var date_template = '';

		var creation_date = new Date(image["imagePushedAt"]*1000);
		date_template = '<div class="image-pushed-at">Created: ' + (creation_date.getMonth() + 1) + '/' + creation_date.getDate() + '/' + creation_date.getFullYear() + '</div>';

		// Create dropdown with all image versions
		if (index == 0) {
			template += `
							<div class="selectbox__selected selectbox__selected-${repo_idx}" data-value="" image-digest=${image["imageDigest"]}>
								<div class="repository-name">${repo_data["repositoryName"]}</div>${tags_template}${date_template}
								<div class="image-digest">${image["imageDigest"]}</div>
								<div class="image-pull">PULL IMAGE</div>
							</div>
							<div class="selectbox__values selectbox__values-${repo_idx}">
						`;
		}
		template  += `
						<div class="selectbox__item selectbox__item-${repo_idx}" data-value="" image-digest=${image["imageDigest"]}>
							<div class="repository-name">${repo_data["repositoryName"]}</div>${tags_template}${date_template}
							<div class="image-digest">${image["imageDigest"]}</div>
						</div>
					`;

	}
	template += '</div></div>';

	// Move this to a general function rather than having a separate script per repository in the list
	template += `
		<script>
		// calling .off so we don't re-register events when images refresh
		jQuery(document).off('click', '.selectbox__selected-${repo_idx} > .image-pull').on('click', '.selectbox__selected-${repo_idx} > .image-pull', function() {
			var digest = jQuery('.selectbox__selected-${repo_idx}').attr('image-digest');
			var repository = jQuery('.selectbox__selected-${repo_idx} > .repository-name').text();
			registry.pullImage(repository, digest);
		});

		jQuery(document).off('click', '.selectbox__selected-${repo_idx} > .repository-name').on('click', '.selectbox__selected-${repo_idx} > .repository-name', function() {
    		jQuery('.selectbox__values-${repo_idx}').toggle();
		});
			
		jQuery(document).off('click', '.selectbox__item-${repo_idx}').on('click', '.selectbox__item-${repo_idx}', function() {
		  var value = $(this).html();
		  var digest = $(this).attr('image-digest');
		  
		  jQuery('.selectbox__selected-${repo_idx}').attr({
		  													'data-value': value,
		  													'image-digest': digest
		  													});

		  jQuery('.selectbox__selected-${repo_idx}').html(value);
	  
		  jQuery('.selectbox__values-${repo_idx}').toggle();
		});
		</script>
		`;

	return template;
}


function showRepos(filter){

	var repos = registry.getReposAndImages(filter);
	var display_html = '';
	for (let [index, repo] of repos.entries()) {
		display_html += repoFormatter(repo, index);
	}

	return display_html;
}


function imageFormatter(image_data, image_idx) {

	// Format local images display

	// Available example of Image data to display

	/*	
	Containers: -1,
    Created: 1525418794,
    Id: 'sha256:001d5142f8e6a1008c6077459f58e2d8414ec6cfef9dcf6d83f32e1b37f11f90',
    Labels: null,
    ParentId: 'sha256:8b932f53574a1c970ae4ace8efdfebcc57092805ee49ce49f02c379d624259c8',
    RepoDigests: null,
    RepoTags: 
     [ 'image/name:tag1',
       'image/name:tag2' ],
    SharedSize: -1,
    Size: 20949787157,
    VirtualSize: 20949787157 }
	*/
	var template = '<div class = "local_image local_image-' + image_idx + '">';
	if (image_data["RepoTags"]) {

		var seen_tags = []
		for (let [index, repo_tag] of image_data["RepoTags"].entries()) {
			if (index == 0) {
				var name = repo_tag.split(":")[0];
				if (name.split("/")[0].includes("amazonaws")) {
					name = name.split("/").slice(1).join("/");
				}
				template += '<div class="local_image_name">' + name + '</div>';
			}

			var tag = repo_tag.split(":")[1];
			if (!seen_tags.includes(tag)) { 
				seen_tags.push(tag);
				template += '<div class="local_image_tag"><span class="local_image_tag-text">' + tag + '</span></div>';
			}

		}
	}

	template += '<div class="local_image_created">' + image_data["Created"] + '</div>';
	template += '<div class="local_image_id">' + image_data["Id"] + '</div>';



	var configs = fs.readdirSync('config/');

	template += `
				<div class="local_image_buttons">
					<div class="local_image_createcontainer_button">Create Container</div>
					`;
	template += '<select class="local_image_containerconfig"><option value="none">Select Config</option>';
	for (config of configs) {
		template += '<option value="' + config + '">' + config + '</option>'
	}
	template += '</select>'
	template += `	<div class="local_image_delete_button">DELETE</div>
				</div>
				`;

	template += '</div>';

	// Button functionality
	if (image_data["RepoTags"]==null) {
		var image_name = 'dangling';
	} else {
		var image_name = image_data["RepoTags"][0];
	}
	template += `
		<script>
		// Calling .off() so we don't re-register events every time we refresh
		jQuery(document).off('click', '.local_image-${image_idx} .local_image_createcontainer_button').on('click', '.local_image-${image_idx} .local_image_createcontainer_button', function() {
	
			var config_file = jQuery('.local_image_containerconfig').val()

			if ('${image_name}' == 'dangling' | '${image_name}' == '<none>:<none>') {
				alert('Cannot create container with an untagged image.')
			}
			else {
				local.createContainer('${image_name}', config_file);
			}
		});

		</script>
		`;

	return template;
}

async function showLocalImages(filter){
	var images = await local.getImageList(filter); 
	var display_html = '';
	image_num = 0;
	for (let [index, image] of images.entries()) {
		if (image["RepoTags"]!=null & image["RepoTags"]!='<none>:<none>') {
			image_num += 1;
			display_html += imageFormatter(image, image_num);
		};

	}
	return display_html;
}

async function containerFormatter(container_data, container_idx) {


	/* Available Container Data To Expose
	[ 'Id',
	  'Names',
	  'Image',
	  'ImageID',
	  'Command',
	  'Created',
	  'Ports',
	  'Labels',
	  'State',
	  'Status',
	  'HostConfig',
	  'NetworkSettings',
	  'Mounts' ]
	 */


	var template = '<div class = "container container-' + container_idx + '">';
	template += '<div class="containerName">' + container_data["Names"] + '</div>';
	template += '<div class="containerImageName"><span class="containerImageName-text">' + container_data["Image"] + '</span></div>';
	
	template += '<div class="containerState">';
	if (container_data["State"]=='running') {
		template += '<span class="container-state container_state_running" title="' + container_data["State"] + '""></span>';
	} else if (container_data["State"]=='exited') {
		template += '<span class="container-state container_state_exited" title="' + container_data["State"] + '""></span>';
	} else {
		template += '<span class="container-state container_state_other" title="' + container_data["State"] + '""></span>';
	}
	template += '</div>';
	template += '<div class="containerStatus">' + container_data["Status"] + '</div>';

	template += `
				<details class="more_info">
				<summary class="more_info_label">More Info</summary>
				`;


	template += '<div class="containerImageId"><div class = "image-id-title mi_subsection_title">ID</div>';
	template += '<div class="image-id">' + container_data["ImageID"] + '</div></div>';

	var ports_template = '';
	ports_template += '<div class = "image-ports"><div class = "image-ports-title mi_subsection_title">Ports</div>';
	if (container_data["Ports"]) {
		for (port of container_data["Ports"]) {
			ports_template += '<div class = "image-port">' + port["PrivatePort"] + ":" + port["PublicPort"] + ":" + port["Type"] + '</div>';
		}
	}
	ports_template += '</div>';
	template += ports_template;

	await local.getImageData(container_data["Image"]).then(function(image) {
				var tags_template = '<div class = "image-tags"><div class = "image-tags-title mi_subsection_title">Tags</div>';
				var seen_tags = [];
				if (image["RepoTags"]) {
					for (tag of image["RepoTags"]) {
						tag = tag.split(":");
						tag = tag[tag.length-1];
						if (!seen_tags.includes(tag)) {
							seen_tags.push(tag);
							tags_template += '<div class = "image-tag"><span class ="image-tag-text">' + tag.split(":") + '</div>';
						}

					}
				}
				tags_template += '</div>';
				template += tags_template;
			});
	template += '</details>';


	template += `
				<div class="containerButtons">
					<div class="containerStartButton">Start</div>
					<div class="containerStopButton">Stop</div>
					<div class="containerDeleteButton">DELETE</div>
				</div>
				`;

	template += '</div>';


	// Button functionality
	template += `
		<script>
		// Calling .off() so we don't re-register events every time we refresh
		jQuery(document).off('click', '.container-${container_idx} .containerStartButton').on('click', '.container-${container_idx} .containerStartButton', function() {
			local.startContainer('${container_data["Id"]}');
		});

		jQuery(document).off('click', '.container-${container_idx} .containerStopButton').on('click', '.container-${container_idx} .containerStopButton', function() {
			local.stopContainer('${container_data["Id"]}');
		});
		</script>
		`;
	// create a container entity. does not query API

	return await template;

}



async function showContainers() {
	var display_html = '';
	var containers = await local.getContainerList();
	for (let [index, container] of containers.entries()) {
		await containerFormatter(container, index).then(function(result) {display_html += result});
	}
	return await display_html;	
}


// Exports
module.exports.showRepos = showRepos;
module.exports.showContainers = showContainers;
module.exports.showLocalImages = showLocalImages;