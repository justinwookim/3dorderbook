import React, { useState, useEffect, useCallback } from 'react';
import { PerspectiveCamera, Scene, WebGLRenderer, HemisphereLight, PointLight, Color, Fog } from 'three';
import { BookAnimation } from './3DBookAnimation';
import { KrakenFeedHandler } from './FeedHandler/FeedHandler';
import { OrderBook } from './OrderBook';
import { InstrumentRepository, fetchBitMEXInstruments } from './CombinedInstruments';

const ThreeScene = () => {
    const [instrumentRepository, setInstrumentRepository] = useState<InstrumentRepository | null>(null);
    const [orderBook, setOrderBook] = useState(new OrderBook());
    const [selectedInstrument, setSelectedInstrument] = useState('ETH/USDT'); // Default instrument
    const [animation, setAnimation] = useState<BookAnimation | null>(null);

    const updateOrderBook = useCallback((updatedOrderBook: OrderBook) => {
        setOrderBook(updatedOrderBook);
    }, []);

    useEffect(() => {
        const initializeInstruments = async () => {
            try {
                const instruments = await fetchBitMEXInstruments();
                const instrumentRepo = new InstrumentRepository({ 'Kraken': instruments });
                setInstrumentRepository(instrumentRepo);
            } catch (error) {
                console.error('Error fetching instruments:', error);
            }
        };
        initializeInstruments();
    }, []);

    useEffect(() => {
        if (instrumentRepository) {
            const scene = new Scene();
            const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            const renderer = new WebGLRenderer();
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(renderer.domElement);

            const newAnimation = new BookAnimation(scene, camera, orderBook, renderer.domElement, 100);
            newAnimation.create();
            setAnimation(newAnimation);

            const feedManager = new KrakenFeedHandler(selectedInstrument, orderBook, updateOrderBook);
            feedManager.setBookAnimation(newAnimation);
            feedManager.connect();

            const ambientLight = new HemisphereLight(0x999999);
            scene.add(ambientLight);

            const pointLight = new PointLight(0x999999, 1.1);
            pointLight.position.set(0, 100, -100);
            scene.add(pointLight);

            scene.background = new Color(0x222222);
            scene.fog = new Fog(0x222222, 360, 400);

            const onWindowResize = () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            };
            window.addEventListener('resize', onWindowResize);

            const animate = () => {
                requestAnimationFrame(animate);
                newAnimation.update();
                renderer.render(scene, camera);
            };
            animate();

            return () => {
                window.removeEventListener('resize', onWindowResize);
                document.body.removeChild(renderer.domElement);
                feedManager.disconnect();
            };
        }
    }, [instrumentRepository, selectedInstrument, updateOrderBook, orderBook]);

    const handleInstrumentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newInstrument = event.target.value;
        setSelectedInstrument(newInstrument);
    };

    return (
        <div id="gui">
            <select onChange={handleInstrumentChange} value={selectedInstrument}>
                {instrumentRepository && instrumentRepository.getExchangeInstruments('Kraken').map((instrument, index) => (
                    <option key={index} value={instrument.symbol}>{instrument.symbol}</option>
                ))}
            </select>
        </div>
    );
};

export default ThreeScene;
