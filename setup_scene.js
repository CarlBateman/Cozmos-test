import * as THREE from 'three';
import * as TransformControls from 'TransformControls';

let camera = null;
let scene = null;
let renderer = null;
let pointer = new THREE.Vector2();
let meshes = [];
let control = null;
let currentSelection = null;

function setup() {
	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
	camera.position.z = 1;

	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setClearColor(0x000040, 1);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setAnimationLoop(animation);
	document.body.appendChild(renderer.domElement);

	control = new TransformControls.TransformControls(camera, renderer.domElement);
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
	renderer.render(scene, camera);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPointerMove(event) {
	pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
	pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

function onkeyup(e) {
	if (e.key == "Delete" || e.key == "Backspace") {
		if (currentSelection != null) {
			control.detach();
			currentSelection.visible = false;
			currentSelection = null;
		}
	}
}

function pick(event) {
	event.preventDefault();

	const raycaster = new THREE.Raycaster();
	raycaster.setFromCamera(pointer, camera);

	const intersects = raycaster.intersectObjects(meshes);
	if (intersects.length > 0) {
		currentSelection = intersects[0].object;
		control.attach(intersects[0].object);
		scene.add(control);
		control.setMode('translate');
		control.addEventListener('change', render);
	} else {
		control.detach();
		currentSelection = null;
	}

}

let temp = { setup, add, pick, onWindowResize, onPointerMove, onkeyup };

export { temp as scene };