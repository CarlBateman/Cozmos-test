import { scene } from "./setup_scene.js";

scene.setup();


let btnAddVideo = document.getElementById('button');
btnAddVideo.addEventListener('click', scene.add);
//scene.add();
// add box