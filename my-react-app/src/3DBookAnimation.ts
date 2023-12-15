import { Scene, PerspectiveCamera, Mesh, BoxGeometry, MeshLambertMaterial, Color, Object3D, Vector3 } from 'three';
import { OrderBook, Order } from './OrderBook';
import { SceneManager } from './Components/SceneManager';
import { CameraManager } from './Components/CameraManager';

export class BookAnimation {
    private sceneManager: SceneManager;
    private cameraManager: CameraManager;
    private orderBook: OrderBook;
    private scene: Scene;
    private camera: PerspectiveCamera;
    private meshGroups: {
        bidMeshes: Mesh[],
        askMeshes: Mesh[]
    };
    private maxDepth: number;
    private tickSize: number;
    private scalingFactor: number;

    constructor(scene: Scene, camera: PerspectiveCamera, orderBook: OrderBook, rendererDomElement: HTMLElement, maxDepth: number = 400) {
        this.scene = scene;
        this.camera = camera;
        this.orderBook = orderBook;
        this.sceneManager = new SceneManager(scene);
        this.cameraManager = new CameraManager(camera, rendererDomElement, maxDepth);
        this.meshGroups = { bidMeshes: [], askMeshes: [] };
        this.maxDepth = maxDepth;
        this.tickSize = 1; // Initial tick size, update dynamically as needed
        this.scalingFactor = 1; // Update this based on your data
    }

    create() {
        try {
            console.log('Creating BookAnimation');
            this.recalculate();
            this.draw();
        } catch (error) {
            console.error('Error in creating BookAnimation:', error);
        }
    }

    update() {
        try {
            this.resetMeshes();
            this.recalculate();
            this.draw();
        } catch (error) {
            console.error('Error in updating BookAnimation:', error);
        }
    }

    destroy() {
        this.resetMeshes();
    }

    setTickSize(newTickSize: number) {
        this.tickSize = newTickSize;
        this.recalculate();
    }

    private resetMeshes() {
        Object.values(this.meshGroups).forEach(group => {
            group.forEach(mesh => this.sceneManager.disposeElement(mesh));
            group.length = 0;
        });
    }

    private recalculate() {
        // Logic to update your scaling factor, price history, size, and side matrices
        // This should be based on the current state of your order book
    }

    private draw() {
        console.log("DRAW", this.orderBook); 
        this.createMeshesForOrders(this.orderBook.getBuyOrders(), this.meshGroups.bidMeshes, new Color(0x00ff00));
        this.createMeshesForOrders(this.orderBook.getSellOrders(), this.meshGroups.askMeshes, new Color(0xff0000));
    }

    private createMeshesForOrders(orders: Order[], meshGroup: Mesh[], color: Color) {
        orders.forEach((order, index) => {
            const mesh = this.createOrderMesh(order, color);
            mesh.position.set(0, index, 0); // Adjust positioning as needed
            this.sceneManager.addElement(mesh);
            meshGroup.push(mesh);
        });
    }

    private createOrderMesh(order: Order, color: Color): Mesh {
        const geometry = new BoxGeometry(this.tickSize, order.quantity * this.scalingFactor, this.tickSize);
        const material = new MeshLambertMaterial({ color: color });
        return new Mesh(geometry, material);
    }
}
