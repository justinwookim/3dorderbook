import { Camera, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


export enum CameraMode {
    Front = 'Front',
}

export class CameraManager {
    private camera: Camera;
    private cameraOrbitControls: OrbitControls;

    constructor(camera: Camera, rendererDomElement: HTMLElement, depth: number) {
        this.camera = camera;

        // Initialize OrbitControls for the Front view
        this.cameraOrbitControls = new OrbitControls(camera, rendererDomElement);
        this.cameraOrbitControls.enablePan = false;
        this.cameraOrbitControls.enableRotate = false;
        this.cameraOrbitControls.enableZoom = true;
    }

    updateCamera() {
        // Update the camera using OrbitControls
        this.cameraOrbitControls.update();
    }
}