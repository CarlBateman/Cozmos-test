﻿import { controller } from "./controller.js";

controller.setup();


let btnAddVideo = document.getElementById('button');
btnAddVideo.addEventListener('click', controller.addTexturedMesh);

window.addEventListener('resize', controller.onWindowResize);
document.addEventListener('pointermove', controller.onPointerMove);
document.addEventListener('mousedown', controller.onMouseDown);
document.addEventListener('mouseup', controller.onMouseUp);
document.addEventListener('keyup', controller.onKeyUp);
document.addEventListener('keydown', controller.onKeyDown);

document.getElementById("control_options").addEventListener('mousedown', () => event.stopPropagation() );
