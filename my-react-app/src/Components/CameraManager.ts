import { Camera, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


export enum CameraMode {
    Front = 'Front',
}

export class CameraManager {
    private camera: Camera;
    private cameraOrbitControls: OrbitControls;
    // private cameraXwingOffset: number;

    constructor(camera: Camera, rendererDomElement: HTMLElement, depth: number) {
        this.camera = camera;
        // this.cameraXwingOffset = Math.round(depth / 2);

        // Initialize OrbitControls for the Front view
        this.cameraOrbitControls = new OrbitControls(camera, rendererDomElement);
        this.cameraOrbitControls.enablePan = false;
        this.cameraOrbitControls.enableRotate = false;
        this.cameraOrbitControls.enableZoom = true;

        // Set camera to the Front view by default
        this.setFrontCamera();
    }

    private setFrontCamera() {
        this.camera.position.set(0, 40, (this.cameraXwingOffset * 2) / 14);
        this.cameraOrbitControls.enabled = true;
        this.cameraOrbitControls.target = new Vector3(0, 0, -this.cameraXwingOffset / 6);
    }

    updateCamera() {
        // Update the camera using OrbitControls
        this.cameraOrbitControls.update();
    }
}

// Usage in your main application
// const cameraManager = new CameraManager(camera, renderer.domElement, depth);
// cameraManager.updateCamera();
