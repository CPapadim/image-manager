var registry = require('./registry.js');
var local = require('./local.js');


function repoFormatter(repo_data, repo_idx) {

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

		jQuery(document).on('click', '.selectbox__selected-${repo_idx} > .image-pull', function() {
			var digest = jQuery('.selectbox__selected-${repo_idx}').attr('image-digest');
			var repository = jQuery('.selectbox__selected-${repo_idx} > .repository-name').text();
			registry.pullImage(repository, digest);
		});

		jQuery(document).on('click', '.selectbox__selected-${repo_idx} > .repository-name', function() {
    		jQuery('.selectbox__values-${repo_idx}').toggle();
		});
			
		jQuery(document).on('click', '.selectbox__item-${repo_idx}', function() {
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