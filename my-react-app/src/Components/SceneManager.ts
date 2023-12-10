import { Object3D, Scene, Mesh } from 'three';

export class SceneManager {
    private scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    addElement(element: Object3D): void {
        this.scene.add(element);
    }

    removeElement(element: Object3D): void {
        this.scene.remove(element);
    }

    disposeElement(element: Object3D): void {
        // Check if the element is a Mesh and has geometry and material properties
        if (element instanceof Mesh) {
            if (element.geometry) {
                element.geometry.dispose();
            }

            if (Array.isArray(element.material)) {
                element.material.forEach(material => material.dispose());
            } else if (element.material) {
                element.material.dispose();
            }
        }

        // If your application uses other Three.js object types with disposables,
        // you can add additional checks and disposals here.
    }

    // You can add more methods here to handle other scene-related functionalities.
    // For example, updating elements, resetting the scene, etc.
}


// 1. The `SceneManager` class is designed to manage the `Scene` object from Three.js.
// 2. The `addElement` and `removeElement` methods are straightforward: they add or remove elements (like meshes, lights, etc.) from the scene.
// 3. The `disposeElement` method is an example of how you might handle resource cleanup. This is important for WebGL applications to avoid memory leaks, especially when you frequently add and remove elements.

// You might need to expand this class with additional methods depending on the specific requirements of your application. For instance, if you have specific routines for updating or resetting the scene, those could be added as methods to this class.

// When integrating `SceneManager` into your application, you'll create an instance of it and use its methods to manage all scene-related operations, making the main code cleaner and more manageable.