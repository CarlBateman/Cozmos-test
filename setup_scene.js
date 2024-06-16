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

function add() {
	const txtURL = document.getElementById("txtURL").value;
	if (isValidUrl(txtURL)) {
		const videoElement = document.createElement("video");
		videoElement.crossOrigin = "anonymous";
		//videoElement.src = "https://i.imgur.com/zRgJ6in.mp4";
		videoElement.src = txtURL;
		videoElement.load();
		videoElement.controls = true;
		videoElement.play();
		videoElement.addEventListener("loadedmetadata", function (e) {
			const ratio = this.videoHeight / this.videoWidth;
			let texture = new THREE.VideoTexture(videoElement);

			const geometry = new THREE.PlaneGeometry(0.5, 0.5 * ratio);
			//const material = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });
			const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: texture });

			const mesh = new THREE.Mesh(geometry, material);
			//mesh.rotateX(90);
			//mesh.rotateY(90);

			scene.add(mesh);
			meshes.push(mesh);
		}, false);

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