import { scene } from "./setup_scene.js";

scene.setup();


let btnAddVideo = document.getElementById('button');
btnAddVideo.addEventListener('click', scene.add);

window.addEventListener('resize', scene.onWindowResize);
document.addEventListener('pointermove', scene.onPointerMove);
document.addEventListener('mousedown', scene.onMouseDown);
document.addEventListener('mouseup', scene.onMouseUp);
document.addEventListener('keyup', scene.onKeyUp);
document.addEventListener('keydown', scene.onKeyDown);

//scene.add();
// add box