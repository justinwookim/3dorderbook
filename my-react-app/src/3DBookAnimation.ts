// BookAnimation.ts
import { Scene, MeshLambertMaterial, Color, Mesh, Object3D, PerspectiveCamera } from 'three';
// import { TradeEvent } from './FeedHandler/FeedHandler'; // Update the path as needed
import { SceneManager } from './Components/SceneManager';
import { CameraManager, CameraMode } from './Components/CameraManager';
import { PriceLevelManager } from './Components/PriceLevelManager';
import { Instrument, InstrumentRepository, initializeAndSaveInstruments, fetchBitMEXInstruments } from './CombinedInstruments';
import { orderType, Order, OrderBook} from './OrderBook';
// Import any other dependencies

export class BookAnimation {
    public sceneManager: SceneManager;
    public cameraManager: CameraManager;
    public priceLevelManager: PriceLevelManager;
    public instrumentRepository: InstrumentRepository; 
    private depth: number;
    private numTicks: number;
    private ticksPerLabel = 20;
    private labelsPerSide = 0;
    private box: Object3D<Mesh, MeshLambertMaterial> | undefined;
    private totalLabels = 0;
    private writtenText: [];
    // Other private properties and dependencies

    constructor(scene: Scene, camera: PerspectiveCamera, book: OrderBook, numTicks: number, depth: number, rendererDomElement: HTMLElement) {
        this.sceneManager = new SceneManager(scene);
        this.cameraManager = new CameraManager(camera, rendererDomElement, depth);
        this.priceLevelManager = new PriceLevelManager(depth, numTicks);
        this.depth = depth;
        this.numTicks = numTicks;
        this.setup();  
        // Initialize other properties
    }

    async setup() {
        const instruments = await fetchBitMEXInstruments(); 
        this.instrumentRepository = new InstrumentRepository({ 'Kraken': instruments }); 
    }
    // Methods to manage the animation

    // create(): void {
    //     // Logic to create the animation
    // }

    // Create functionality:
    create(): void {
        this.createBox();
        this.createLabels();
        // this.reset();
    }
    
    createBox() {
        const boxGeometry = new Mesh(this.depth, 1, 1);
        const boxMaterial = new MeshLambertMaterial({ color: 0xffffff });
        this.box = new Object3D(boxGeometry, boxMaterial, 2 * this.numTicks * this.depth);
        this.sceneManager.addElement(this.box);
        this.setColor(Color(0xF0D0C9));
    }

    
    createLabels() {
        this.labelsPerSide = Math.floor(this.numTicks / this.ticksPerLabel);
        this.totalLabels = 1 + 2 * this.labelsPerSide;
    
        // Add text to the label
    }
      
    setColor(color: Color) {
        for (let i = 0; i < 2 * this.depth * this.numTicks; i++) {
            this.box.setColorAt(i, Color);
        }
    }

    destroy(): void {
        // Logic to clean up and destroy the animation
    }

    reset(): void{
        // Logic to reset the animation
    }

    update(): void {
        // Logic to update the animation each frame or on data change
    }

    // setCameraMode(mode: CameraMode): void {
    //     this.cameraManager.setCameraMode(mode);
    // }

    // addTrade(trade: TradeEvent): void {
    //     // Logic to add a trade
    // }

    // Other methods as needed
}

// Usage example (in a React component):
// useEffect(() => {
//   const animation = new BookAnimation(scene, camera, book, numTicks, depth);
//   animation.create();
//   return () => animation.destroy();
// }, []);
