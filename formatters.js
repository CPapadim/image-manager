var registry = require('./registry.js')





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


// Exports
module.exports.showRepos = showRepos;