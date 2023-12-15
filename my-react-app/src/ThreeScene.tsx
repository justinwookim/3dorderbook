import React, { useState, useEffect, useCallback } from 'react';
import { PerspectiveCamera, Scene, WebGLRenderer, HemisphereLight, PointLight, Color, Fog } from 'three';
import { BookAnimation } from './3DBookAnimation';
import { KrakenFeedHandler } from './FeedHandler/FeedHandler';
import { OrderBook } from './OrderBook';
import { InstrumentRepository, fetchBitMEXInstruments } from './CombinedInstruments';

const ThreeScene = () => {
    const [instrumentRepository, setInstrumentRepository] = useState<InstrumentRepository | null>(null);
    const [orderBook, setOrderBook] = useState(new OrderBook());

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

            const animation = new BookAnimation(scene, camera, orderBook, renderer.domElement, 10);
            animation.create();

            const feedManager = new KrakenFeedHandler('ETH/USDT', orderBook, updateOrderBook);
            feedManager.setBookAnimation(animation);
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
                animation.update();
                renderer.render(scene, camera);
            };
            animate();

            return () => {
                window.removeEventListener('resize', onWindowResize);
                document.body.removeChild(renderer.domElement);
                animation.destroy();
                feedManager.disconnect();
            };
        }
    }, [instrumentRepository, updateOrderBook, orderBook]);

    return <div id="gui"></div>;
};

export default ThreeScene;
