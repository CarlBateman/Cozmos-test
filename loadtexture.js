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
				return txtURL;
			})
	//		.catch(function (error) {
	//			return false;
	//		});
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

function getTexture(response, txtURL) {
	const type = (response.headers.get("Content-Type"));
	switch (true) {
		case type.includes("video"):
			return (getVideoTexture(txtURL));
			break;
		case type.includes("image"):
			return (getImageTexture(txtURL));
			break;
		default:
	}
}

function getImageOrVideoTexture(txtURL) {
	return new Promise(function (resolve) {
			fetch(txtURL)
			.then(function (response) {
				resolve(getTexture(response, txtURL));
			})
			.catch(function (error) {
				return false;
			});
	});
}

function getImageOrVideoTextureOLD(txtURL) {
	return new Promise(function (resolve) {
		if (!isValidUrl(txtURL)) return;

		checkUrlExists(txtURL)
			.then(function (txtURL) { return fetch(txtURL) })
			.then(function (response) {
				resolve(getTexture(response, txtURL));
			}
			);
	});
}




export { getImageOrVideoTexture };