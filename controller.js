import * as THREE from 'three';
import { TransformControls } from 'TransformControls';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';


let camera, scene, renderer;
let pointer = new THREE.Vector2();
let meshes = [];
let inactiveMeshes = [];
let currentSelection = null;
let dragging = false;
let grabPoint = null;
let plane = new THREE.Plane();
const raycaster = new THREE.Raycaster();
let composer, effectFXAA, outlinePass;
let shiftKey = false, ctrlKey = false, altKey = false;



function setup() {
	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
	camera.position.z = 1.1;
	//camera.position.x = 10.9;
	//camera.rotateY(-0.2);

	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setClearColor(0x000040, 1);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setAnimationLoop(animation);
	document.body.appendChild(renderer.domElement);
	//window.addEventListener('resize', scene.onWindowResize);


	// postprocessing

	composer = new EffectComposer(renderer);

	const renderPass = new RenderPass(scene, camera);
	composer.addPass(renderPass);

	outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
	//outlinePass.edgeStrength = 10;
	outlinePass.edgeGlow = 4;
	//outlinePass.edgeThickness = 4;

	composer.addPass(outlinePass);

	const textureLoader = new THREE.TextureLoader();
	textureLoader.load('textures/tri_pattern.jpg', function (texture) {

		outlinePass.patternTexture = texture;
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		outlinePass.usePatternTexture = true;

	});

	const outputPass = new OutputPass();
	composer.addPass(outputPass);

	effectFXAA = new ShaderPass(FXAAShader);
	effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
	composer.addPass(effectFXAA);
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
	const textureLoad = loader.loadAsync(URL).then(function (texture) {
		const ratio = texture.image.height / texture.image.width;

		const geometry = new THREE.PlaneGeometry(0.5, 0.5 * ratio);
		const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
		const mesh = new THREE.Mesh(geometry, material);
		//mesh.position.z = 0.1;
		//mesh.position.x = 10;
		//mesh.position.y = 1;
		scene.add(mesh);
		meshes.push(mesh);
	});


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
	composer.render();
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
	composer.setSize(window.innerWidth, window.innerHeight);

	effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
}

function onKeyDown(e) {
	shiftKey = e.shiftKey;
	ctrlKey = e.ctrlKey;
	altKey = e.altKey;
}

function onKeyUp(e) {
	shiftKey = e.shiftKey;
	ctrlKey = e.ctrlKey;
	altKey = e.altKey;
	if (e.key == "Delete" || e.key == "Backspace") {
		if (currentSelection != null) {

			const index = meshes.indexOf(currentSelection);
			meshes.splice(index, 1);
			inactiveMeshes.push(currentSelection);

			currentSelection.visible = false;
			currentSelection = null;
		}
		return;
	}
}

function onMouseUp(event) {
	dragging = false;
}

function onMouseDown(event) {
	event.preventDefault();

	const raycaster = new THREE.Raycaster();
	raycaster.setFromCamera(pointer, camera);

	const intersects = raycaster.intersectObjects(meshes);
	if (intersects.length > 0) {
		dragging = true;

		currentSelection = intersects[0].object;
		outlinePass.selectedObjects = [currentSelection];

		// construct plane perpendicular to camera forward passing through current selection
		let fwd = new THREE.Vector3();
		camera.getWorldDirection(fwd);

		let d = currentSelection.position.clone();
		d.negate();
		d.projectOnVector(fwd);

		// get signed distance
		let sd = d.dot(fwd);

		// set plane
		plane.set(fwd, sd);

		// cast ray to find grab point
		const intersect = new THREE.Vector3();
		raycaster.ray.intersectPlane(plane, intersect);

		grabPoint = intersect;

		//for debug put sphere on intersect point
		//const geometry = new THREE.SphereGeometry(0.05);
		//const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
		//const mesh1 = new THREE.Mesh(geometry, material);
		//mesh1.position.set(...intersect);
		//scene.add(mesh1);
	} else {
		//control.detach();
		currentSelection = null;
		outlinePass.selectedObjects = [];
	}
}

function debugShowPoint(pos) {
		//for debug put sphere on intersect point
		const geometry = new THREE.SphereGeometry(0.01);
		const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
		const mesh = new THREE.Mesh(geometry, material);
		mesh.position.set(...pos);
		scene.add(mesh);
}

function onPointerMove(event) {
	pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
	pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

	if (dragging) {
		// cast ray to find new grab point
		const newGrabPoint = new THREE.Vector3();
		raycaster.setFromCamera(pointer, camera);
		raycaster.ray.intersectPlane(plane, newGrabPoint);
		//debugShowPoint(currentSelection.position);

		let change = grabPoint.clone();
		change.sub(newGrabPoint);
		//debugShowPoint(grabPoint);

		if (ctrlKey) {
			let a = grabPoint.clone().sub(currentSelection.position);
			let b = newGrabPoint.clone().sub(currentSelection.position);


			let localA = a.clone();
			let localB = b.clone();
			//currentSelection.worldToLocal(a);
			//currentSelection.worldToLocal(b);

			//let localC = currentSelection.position.clone();
			//currentSelection.worldToLocal(localC);

			//let ba = localB.clone().cross(localA);
			let ab = localA.clone().cross(localB);


			let r = localB.angleTo(localA);
			currentSelection.rotateZ(r * Math.sign(ab.z));
		} else {
			currentSelection.position.sub(change);
		}
		grabPoint = newGrabPoint;
	}
}

let temp = { setup, add, onMouseDown, onWindowResize, onPointerMove, onMouseUp, onKeyUp, onKeyDown };

export { temp as controller };