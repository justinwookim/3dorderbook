import { Camera, Vector3 } from 'three';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { indexWindowAverage } from '../Utils/utils.ts'; // Update this path to your utility functions


export enum CameraMode {
    Front = 'Front',
    XWing = 'X-Wing',
    FPS = 'FPS'
}


export class CameraManager {
    private camera: Camera;
    private cameraMode: CameraMode;
    private cameraFPSControls: FirstPersonControls;
    private cameraOrbitControls: OrbitControls;
    private cameraXwingOffset: number;
    private xwingSmoothingFactor: number;

    constructor(camera: Camera, rendererDomElement: HTMLElement, depth: number) {
        this.camera = camera;
        this.cameraMode = CameraMode.Front;
        this.cameraXwingOffset = Math.round(depth / 2);
        this.xwingSmoothingFactor = 5;

        this.cameraFPSControls = new FirstPersonControls(camera, rendererDomElement);
        this.cameraFPSControls.enabled = false;
        this.cameraFPSControls.lookSpeed = 0.1;
        this.cameraFPSControls.movementSpeed = 40;

        this.cameraOrbitControls = new OrbitControls(camera, rendererDomElement);
        this.cameraOrbitControls.enablePan = false;
        this.cameraOrbitControls.enableRotate = false;
        this.cameraOrbitControls.enableZoom = true;
    }

    setCameraMode(cameraMode: CameraMode) {
        this.cameraMode = cameraMode;
        switch (cameraMode) {
            case CameraMode.Front:
                this.setFrontCamera();
                break;
            case CameraMode.XWing:
                this.setXWingCamera();
                break;
            case CameraMode.FPS:
                this.setFPSCamera();
                break;
        }
    }

    updateCamera(delta: number, priceHistory: number[], tickSize: number, levelWidth: number) {
        switch (this.cameraMode) {
            case CameraMode.Front:
                this.cameraOrbitControls.update();
                break;
            case CameraMode.XWing:
                this.updateXWingCamera(priceHistory, tickSize, levelWidth);
                break;
            case CameraMode.FPS:
                this.cameraFPSControls.update(delta);
                break;
        }
    }

    private setFrontCamera() {
        this.camera.position.set(0, 40, (this.cameraXwingOffset * 2) / 14);
        this.cameraFPSControls.enabled = false;
        this.cameraOrbitControls.enabled = true;
        this.cameraOrbitControls.target = new Vector3(0, 0, -this.cameraXwingOffset / 6);
    }

    private setXWingCamera() {
        this.camera.position.set(0, 30, -this.cameraXwingOffset);
        this.camera.lookAt(0, 0, 0);
        this.cameraFPSControls.enabled = false;
        this.cameraOrbitControls.enabled = false;
    }

    private setFPSCamera() {
        this.cameraFPSControls.enabled = true;
        this.cameraOrbitControls.enabled = false;
    }

    private updateXWingCamera(priceHistory: number[], tickSize: number, levelWidth: number) {
        const midPrice = priceHistory[0];
        const cameraPrice = indexWindowAverage(priceHistory, this.cameraXwingOffset, this.xwingSmoothingFactor);
        const cameraOffset = (cameraPrice - midPrice) / tickSize;
        this.camera.position.x = cameraOffset * levelWidth;
    }
}



// 1. The `CameraManager` class now encapsulates all camera functionalities.
// 2. The `setCameraMode` method sets the camera mode and configures the camera settings based on the mode.
// 3. The `updateCamera` method updates the camera position and settings based on the mode and provided data.
// 4. Additional private methods (`setFrontCamera`, `setXWingCamera`, `setFPSCamera`, and `updateXWingCamera`) are used to modularize the camera setup logic for different modes.

// You'll need to adjust the import paths for `CameraMode`, `FirstPersonControls`, `OrbitControls`, and any utility functions based on your project structure.

// When you integrate this class back into your main application, you will create an instance of `CameraManager` and use its methods to manage the camera settings and updates.