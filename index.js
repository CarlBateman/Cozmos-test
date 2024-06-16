﻿import { scene } from "./setup_scene.js";

scene.setup();


let btnAddVideo = document.getElementById('button');
btnAddVideo.addEventListener('click', scene.add);

window.addEventListener('resize', scene.onWindowResize);
document.addEventListener('pointermove', scene.onPointerMove);
document.addEventListener('mousedown', scene.pick);

//scene.add();
// add box