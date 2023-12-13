import React, { useState, useEffect } from 'react';
import { PerspectiveCamera, Scene, WebGLRenderer, HemisphereLight, PointLight, Color, Fog } from 'three';
import { BookAnimation } from './3DBookAnimation';
import { KrakenFeedHandler } from './FeedHandler/FeedHandler';
import { OrderBook } from './OrderBook';
import { InstrumentRepository, fetchBitMEXInstruments } from './CombinedInstruments';

const ThreeScene = () => {
    const [instrumentRepository, setInstrumentRepository] = useState<InstrumentRepository | null>(null);

    useEffect(() => {
        // Asynchronously fetch instruments and initialize the InstrumentRepository
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
            // Initialize Three.js components only after instrumentRepository is set
            const scene = new Scene();
            const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            const renderer = new WebGLRenderer();
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(renderer.domElement);

            const initialInstrument = instrumentRepository.getExchangeInstrument('Kraken', '1INCH/USD');
            if (!initialInstrument) {
                instrumentRepository.getExchangeInstruments('Kraken'); 
                console.error('Instrument not found');
                return;
            }

            const book = new OrderBook();
            const feedManager = new KrakenFeedHandler('1INCH/USD');

            const animation = new BookAnimation(scene, camera, book, 200, 400, renderer.domElement);
            animation.create();

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
                // Cleanup
                window.removeEventListener('resize', onWindowResize);
                document.body.removeChild(renderer.domElement);
                animation.destroy();
            };
        }
    }, [instrumentRepository]);

    return <div id="gui"></div>;
};

export default ThreeScene;
