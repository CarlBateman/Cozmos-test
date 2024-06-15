import * as THREE from 'three';

const scene = {
  camera: null,
  scene: null,
  renderer: null,
  meshes: [],

  setup: function() {
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
    this.camera.position.z = 1;

    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0x000040, 1);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setAnimationLoop(this.animation.bind(this));
    document.body.appendChild(this.renderer.domElement);
  },

  add: function () {
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const material = new THREE.MeshNormalMaterial();

    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);
    this.meshes.push(mesh);
  },

  animation: function (time) {

    for (let i = 0; i < this.meshes.length; i++) {
			this.meshes[i].rotation.x = time / 2000;
			this.meshes[i].rotation.y = time / 1000;

		}

    this.renderer.render(this.scene, this.camera);

  }
};


export { scene };