import { Scene, PerspectiveCamera, Mesh, BufferAttribute, BoxGeometry, MeshLambertMaterial, Color, Object3D, BufferGeometry, AxesHelper, MeshBasicMaterial, InstancedMesh } from 'three';
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
    private meshGroups: {
        bidMeshes: Mesh[],
        askMeshes: Mesh[]
    };
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
        this.meshGroups = { bidMeshes: [], askMeshes: [] };
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
            // this.scene.add(new AxesHelper(5));
            this.camera.position.y = 2; 
            this.camera.position.z = 5; 

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
        this.precision = getPrecision(newTickSize); 
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
        for (let i = 0; i < this.maxDepth; i++) {
            this.sizeMatrix.push(Array(2 * this.numTicks).fill(0)); 
            this.orderMatrix.push(Array(2 * this.numTicks).fill(orderType.BUY)); 
        }

        const bids = this.orderBook.getBuyOrders(); 
        const asks = this.orderBook.getSellOrders(); 

        const bestBid = bids[0]; 
        const bestAsk = asks[0]; 

        let midPrice: number = 0; 
        if (bids.length === 0 && asks.length === 0) {
            midPrice = 0; 
        } else if (asks.length === 0) {
            midPrice = bestBid.price; 
        } else if (bids.length === 0) {
            midPrice = bestAsk.price - this.tickSize; 
        } else {
            midPrice = precisionRound(roundDownToTick(1, (bestBid.price + bestAsk.price) / 2), this.precision); 
        }
        
        if (this.priceFlag) {
            // const allSizes = [...bids.map((order: Order) => order.quantity), ...asks.map((order: Order) => order.quantity)].filter((x: number) => x > 0); 
            // if (allSizes.length > 0) {
            //     const avgSize = allSizes.reduce((a, b) => a + b, 0) / allSizes.length; 
            //     this.scalingFactor = 1 / avgSize; 
            // }
            this.priceHistory = Array(this.maxDepth).fill(midPrice); 
            this.priceFlag = false; 
        }

        this.priceHistory.unshift(midPrice); 
        if (this.priceHistory.length > this.maxDepth) {
            this.priceHistory.pop(); 
        }
        
        let cumBid = 0; 
        let cumAsk = 0; 
        const sizeSlice = []; 
        const orderSlice = []; 

        sizeSlice.push(...Array(2 * this.numTicks).fill(0)); 
        orderSlice.push(...Array(2 * this.numTicks).fill(orderType.BUY)); 
        for (let i = 0; i < this.numTicks; i++) {
            const bid = precisionRound(midPrice - (i * this.tickSize), this.precision); 
            const ask = precisionRound(midPrice + ((1 + i) * this.tickSize), this.precision); 
            bids.forEach((order) => { if (order.price === bid) cumBid += order.quantity; }); 
            asks.forEach((order) => { if (order.price === ask) cumAsk += order.quantity; }); 
            sizeSlice[(this.numTicks - 1) - i] = this.scalingFactor * cumBid; 
            orderSlice[(this.numTicks - 1) - i] = orderType.BUY; 
            sizeSlice[this.numTicks + i] = this.scalingFactor * cumAsk; 
            orderSlice[this.numTicks + i] = orderType.SELL; 
        }

        this.sizeMatrix.unshift(sizeSlice); 
        this.orderMatrix.unshift(orderSlice); 
        if (this.sizeMatrix.length > this.maxDepth) {
            // console.log("POP");
            this.sizeMatrix.pop(); 
        }
        if (this.orderMatrix.length > this.maxDepth) {
            // console.log("POPPER");
            this.orderMatrix.pop(); 
        }
    }

    private draw() {
        const midPrice = this.priceHistory[0]; 

        const dummy = new Object3D(); 
        for (let i = 0; i < this.maxDepth; i++) {
            const horizontalOffset = Math.round((this.priceHistory[i] - midPrice) / this.tickSize); 
            for (let j = 0; j < 2 * this.numTicks; j++) {
                const index = (2 * i * this.numTicks) + j; 

                dummy.position.x = horizontalOffset + (j - this.numTicks); 
                dummy.position.z = -i; 
                
                const size = this.sizeMatrix[i][j]; 
                const order = this.orderMatrix[i][j]; 

                dummy.scale.y = size === 0 ? 0.0001 : size; 
                dummy.position.y = dummy.scale.y / 2; 
                dummy.updateMatrix()
                this.sizeBox!.setMatrixAt(index, dummy.matrix); 
                let color = new Color(0x333333); 
                const bidColor = new Color(0x0abc41); 
                const askColor = new Color(0xe63d0f); 
                if (size > 0) {
                    color = (order === orderType.BUY) ? bidColor : askColor; 
                }
                this.sizeBox!.setColorAt(index, color); 
            }
        }
        this.sizeBox!.instanceMatrix.needsUpdate = true; 
        if (this.sizeBox!.instanceColor !== null) {
            this.sizeBox!.instanceColor.needsUpdate = true; 
        }

        for (let i = 0; i < this.numLabels; i++) {
            const price = midPrice + ((i - this.numLabelsPerSide) * 10 * this.tickSize); 
            this.textArray[i].text = price.toLocaleString(undefined, { minimumFractionDigits: this.precision }); 
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
    

    // private createMeshesForOrders(orders: Order[], meshGroup: Mesh[], color: Color) {
    //     orders.forEach((order, index) => {
    //         const mesh = this.createOrderMesh(order, color);
    //         mesh.position.set(0, index, 0); // Adjust positioning as needed
    //         this.sceneManager.addElement(mesh);
    //         meshGroup.push(mesh);
    //     });
    // }

    // private createOrderMesh(order: Order, color: Color): Mesh {
    //     const geometry = new BoxGeometry(this.tickSize, order.quantity * this.scalingFactor, this.tickSize);
    //     const material = new MeshLambertMaterial({ color: color });
    //     return new Mesh(geometry, material);
    // }
}

