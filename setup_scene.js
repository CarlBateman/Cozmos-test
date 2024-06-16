import * as THREE from 'three';

let camera = null;
let scene = null;
let renderer = null;
let meshes = [];

function setup() {
	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
	camera.position.z = 1;

	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setClearColor(0x000040, 1);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setAnimationLoop(animation.bind(this));
	document.body.appendChild(renderer.domElement);
}

function isValidUrl(string) {
	try {
		new URL(string);
		return true;
	} catch (err) {
		return false;
	}
}

function getType(URL) {
	const extension = URL.split('.').pop();
	switch (extension) {
		case "mp4":
		case "mov":
			return "video";
	}

	switch (extension) {
		case "jpg":
		case "jpeg":
		case "gif":
		case "bmp":
		case "img":
			return "image";
	}


	return "invalid";
}

function addVideo(URL) {
	const videoElement = document.createElement("video");
	videoElement.crossOrigin = "anonymous";
	videoElement.src = URL;
	videoElement.load();
	videoElement.controls = true;
	videoElement.play();
	videoElement.addEventListener("loadedmetadata", function (e) {
		const ratio = this.videoHeight / this.videoWidth;
		let texture = new THREE.VideoTexture(videoElement);

		const geometry = new THREE.PlaneGeometry(0.5, 0.5 * ratio);
		const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: texture });

		const mesh = new THREE.Mesh(geometry, material);

		scene.add(mesh);
		meshes.push(mesh);
	}, false);
}

function addImage(URL) {
	const loader = new THREE.TextureLoader();

	// load a resource
	loader.load(
		URL,

		// onLoad callback
		function (texture) {
			const ratio = texture.image.height / texture.image.width;

			const geometry = new THREE.PlaneGeometry(0.5, 0.5 * ratio);
			const material = new THREE.MeshBasicMaterial({ map: texture, map: texture });
			const mesh = new THREE.Mesh(geometry, material);

			scene.add(mesh);
			meshes.push(mesh);
		},

		// onProgress callback currently not supported
		undefined,

		// onError callback
		function (err) {
			console.error('An error happened.');
		}
	);
}

function add() {
	const txtURL = document.getElementById("txtURL").value;
	if (isValidUrl(txtURL)) {
		switch (getType(txtURL)) {
			case "video":
				addVideo(txtURL)
				break;
			case "image":
				addImage(txtURL)
				break;
			default:
		}
	}


}

function animation(time) {

	//for (let i = 0; i < meshes.length; i++) {
	//	meshes[i].rotation.x = time / 2000;
	//	meshes[i].rotation.y = time / 1000;

	//}

	renderer.render(scene, camera);
}

let temp = { setup, add };

export { temp as scene };