import * as THREE from 'three';


function isValidUrl(string) {
	try {
		new URL(string);
		return true;
	} catch (err) {
		return false;
	}
}

function checkUrlExists(txtURL) {
	return fetch(txtURL, { method: 'HEAD' })
		.then(
			function (response) {
				return response.ok;
			})
		.catch(function (error) {
			return false;
		});
}

function getVideoTexture(txtURL) {
	const videoElement = document.createElement("video");
	videoElement.crossOrigin = "anonymous";
	videoElement.src = txtURL;
	videoElement.load();
	videoElement.controls = true;
	videoElement.play();

	return new Promise(function (resolve) {
		videoElement.addEventListener("loadedmetadata", function (e) {
			const ratio = this.videoHeight / this.videoWidth;
			let texture = new THREE.VideoTexture(videoElement);
			resolve({ texture, ratio });
		}, false);
	});
}

function getImageTexture(txtURL) {
	const loader = new THREE.TextureLoader();
	return loader.loadAsync(txtURL).then(
		function (texture) {
			const ratio = texture.image.height / texture.image.width;
			return { texture, ratio };
		});
}

function getImageOrVideoTexture(txtURL) {
	return new Promise(function (resolve) {

		if (isValidUrl(txtURL)) {
			checkUrlExists(txtURL).then(function (exists) {
				if (exists) {

					return fetch(txtURL).then(
						function (response) {
							const type = (response.headers.get("Content-Type"));
							switch (true) {
								case type.includes("video"):
									resolve(getVideoTexture(txtURL));
									break;
								case type.includes("image"):
									resolve(getImageTexture(txtURL));
									break;
								default:
							}
						})

				}
			});
		}
	});
}




export { getImageOrVideoTexture };