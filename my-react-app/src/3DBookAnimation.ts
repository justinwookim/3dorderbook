import { Scene, PerspectiveCamera, Mesh, BufferAttribute, BoxGeometry, MeshLambertMaterial,  Color, Object3D, BufferGeometry, AxesHelper, MeshBasicMaterial, InstancedMesh, MeshNormalMaterial } from 'three';
import { OrderBook, Order, orderType } from './OrderBook';
import { SceneManager } from './Components/SceneManager';
import { CameraManager } from './Components/CameraManager';
import SpriteText from 'three-spritetext';
import { getPrecision, precisionRound, roundDownToTick } from './Utils/utils';

export class BookAnimation {
    private sceneManager: SceneManager;
    private cameraManager: CameraManager;
    private orderBook: OrderBook;
    private scene: Scene;
    private camera: PerspectiveCamera;
    private maxDepth: number;
    private numTicks: number; 
    private tickSize: number;
    private numLabels: number; 
    private precision: number; 
    private numLabelsPerSide: number; 
    private scalingFactor: number;
    private sizeBox: InstancedMesh | undefined; 
    private sizeMatrix: number[][]; 
    private orderMatrix: orderType[][]; 
    private priceHistory: number[]; 
    private priceFlag: boolean; 
    private textArray: SpriteText[]; 

    constructor(scene: Scene, camera: PerspectiveCamera, orderBook: OrderBook, rendererDomElement: HTMLElement, maxDepth: number = 100) {
        this.scene = scene;
        this.camera = camera;
        this.orderBook = orderBook;
        this.sceneManager = new SceneManager(scene);
        this.cameraManager = new CameraManager(camera, rendererDomElement, maxDepth);
        this.maxDepth = maxDepth;
        this.numTicks = 100; 
        this.tickSize = 1; // Initial tick size, update dynamically as needed
        this.precision = 1; // Initial precision, update dynamically as needed
        this.scalingFactor = 1/10; // Update this based on your data
        this.sizeMatrix = []; 
        this.orderMatrix = []; 
        this.priceHistory = []; 
        this.priceFlag = true; 
        this.textArray = []; 
    }

    create() {
        try {
            console.log('Creating BookAnimation');
            this.camera.position.y = 20; 
            this.camera.position.z = 100; 

            const box = this.createBoxGeometry(1, 1, 1)
            const mat = new MeshLambertMaterial({ color: 0xffffff }); 
            this.sizeBox = new InstancedMesh(box, mat, 2 * this.numTicks * this.maxDepth);
            this.sceneManager.addElement(this.sizeBox); 

            this.numLabelsPerSide = Math.floor(this.numTicks / 10); 
            this.numLabels = 1 + 2 * this.numLabelsPerSide; 
            for (let i = 0; i < this.numLabels; i++) {
                const txt = new SpriteText('', 2, '#ffffff'); 
                txt.position.z = 3; 
                txt.position.y = 1;
                txt.position.x = (i - this.numLabelsPerSide) * 10; 
                this.sceneManager.addElement(txt); 
                this.textArray.push(txt); 
            }
            this.recalculate();
            this.draw();
        } catch (error) {
            console.error('Error in creating BookAnimation:', error);
        }
    }

    update() {
        try {
            this.recalculate();
            this.draw();
        } catch (error) {
            console.error('Error in updating BookAnimation:', error);
        }
    }


    recalculate() {
        for (let i = 0; i < this.maxDepth; i++) {
            this.sizeMatrix.push(Array(2 * this.numTicks).fill(0)); 
            this.orderMatrix.push(Array(2 * this.numTicks).fill(orderType.BUY)); 
        }

        const bids = this.orderBook.getBuyOrders(); 
        const asks = this.orderBook.getSellOrders(); 

        const bidsPriceToQuantity = this.orderBook.getBuyMap(); 
        const asksPriceToQuantity = this.orderBook.getSellMap(); 

        const bestBid = bids[0]; 
        const bestAsk = asks[0]; 

        let middlepriceval: number = 0; 
    
  
        middlepriceval = precisionRound(roundDownToTick(1, (bestBid.price + bestAsk.price) / 2), this.precision); 
        
        
        if (this.priceFlag) {
            this.priceHistory = Array(this.maxDepth).fill(middlepriceval); 
            this.priceFlag = false; 
        }

        this.priceHistory.unshift(middlepriceval); 
        if (this.priceHistory.length > this.maxDepth) {
            this.priceHistory.pop(); 
        }
        
        let TotalBid = 0; 
        let TotalAsk = 0; 
        const SizeSection = []; 
        const OrderSection = []; 

        SizeSection.push(...Array(2 * this.numTicks).fill(0)); 
        OrderSection.push(...Array(2 * this.numTicks).fill(orderType.BUY)); 
        for (let i = 0; i < this.numTicks; i++) {
            const bid = precisionRound(middlepriceval - (i * this.tickSize), this.precision); 
            const ask = precisionRound(middlepriceval + ((1 + i) * this.tickSize), this.precision); 
            TotalBid += bidsPriceToQuantity.get(bid) || 0; 
            TotalAsk += asksPriceToQuantity.get(ask) || 0; 
            SizeSection[(this.numTicks - 1) - i] = this.scalingFactor * TotalBid; 
            OrderSection[(this.numTicks - 1) - i] = orderType.BUY; 
            SizeSection[this.numTicks + i] = this.scalingFactor * TotalAsk; 
            OrderSection[this.numTicks + i] = orderType.SELL; 
        }

        this.sizeMatrix.unshift(SizeSection); 
        this.orderMatrix.unshift(OrderSection); 
        if (this.sizeMatrix.length > this.maxDepth) {
            this.sizeMatrix.pop(); 
        }
        if (this.orderMatrix.length > this.maxDepth) {
            this.orderMatrix.pop(); 
        }
    }


    draw() {
        const referenceMidPrice = this.priceHistory[0];
        const tempObject3D = new Object3D();

        for (let depthIndex = 0; depthIndex < this.maxDepth; depthIndex++) {
            const horizontalOffset = Math.round((this.priceHistory[depthIndex] - referenceMidPrice) / this.tickSize);

            for (let tickIndex = 0; tickIndex < 2 * this.numTicks; tickIndex++) {
                const meshIndex = (2 * depthIndex * this.numTicks) + tickIndex;
                tempObject3D.position.x = horizontalOffset + (tickIndex - this.numTicks);
                tempObject3D.position.z = -depthIndex;

                const currentSize = this.sizeMatrix[depthIndex][tickIndex];
                const currentOrderType = this.orderMatrix[depthIndex][tickIndex];

                tempObject3D.scale.y = (currentSize === 0) ? 0.0001 : currentSize;
                tempObject3D.position.y = tempObject3D.scale.y / 2;
                tempObject3D.updateMatrix();

                if (this.sizeBox) {
                    this.sizeBox.setMatrixAt(meshIndex, tempObject3D.matrix);
                    const bidColor = new Color(0x0abc41);
                    const askColor = new Color(0xe63d0f);
                    const color = (currentSize > 0) ? (currentOrderType === orderType.BUY ? bidColor : askColor) : new Color(0x333333);
                    this.sizeBox.setColorAt(meshIndex, color);
                }
            }
        }

        if (this.sizeBox) {
            this.sizeBox.instanceMatrix.needsUpdate = true;
            if (this.sizeBox.instanceColor) {
                this.sizeBox.instanceColor.needsUpdate = true;
            }
        }

        for (let labelIndex = 0; labelIndex < this.numLabels; labelIndex++) {
            const priceAtLabel = referenceMidPrice + ((labelIndex - this.numLabelsPerSide) * 10 * this.tickSize);
            this.textArray[labelIndex].text = priceAtLabel.toLocaleString(undefined, { minimumFractionDigits: this.precision });
        }
    }

    




    

    private createBoxGeometry(width: number, height: number, depth: number) {
        const geometry = new BufferGeometry();
    
        // Define vertices for one face of the box
        const vertices = new Float32Array([
            // Front face
            -width / 2, -height / 2,  depth / 2,
             width / 2, -height / 2,  depth / 2,
             width / 2,  height / 2,  depth / 2,
            -width / 2,  height / 2,  depth / 2,
            
            // Back face
            -width / 2, -height / 2, -depth / 2,
             width / 2, -height / 2, -depth / 2,
             width / 2,  height / 2, -depth / 2,
            -width / 2,  height / 2, -depth / 2,
        ]);
    
        // Define the indices for the triangles
        const indices = [
            0, 1, 2,      2, 3, 0,    // front
            1, 5, 6,      6, 2, 1,    // right
            5, 4, 7,      7, 6, 5,    // back
            4, 0, 3,      3, 7, 4,    // left
            3, 2, 6,      6, 7, 3,    // top
            4, 5, 1,      1, 0, 4     // bottom
        ];
    
        geometry.setIndex(indices);
        geometry.setAttribute('position', new BufferAttribute(vertices, 3));
        
        geometry.computeVertexNormals(); 
    
        return geometry;
    }
}









