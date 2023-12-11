// import React, { useEffect, useRef } from 'react';
// import { orderType, Order, Limit, Book } from './OrderBook';
// import { Mesh, MeshLambertMaterial, Scene, SphereGeometry } from 'three';


// export const TradeIndicator = ({ scene, price, size, orderType, radius, position }) => {
//     const meshRef = useRef();

//     useEffect(() => {
//         if (!scene || !meshRef.current) return;

//         const geometry = new SphereGeometry(radius, 16, 8);
//         const material = new MeshLambertMaterial({ color: 0xebcf34 });
//         const mesh = new Mesh(geometry, material);
//         mesh.position.set(...position);

//         meshRef.current = mesh;
//         scene.add(mesh);

//         return () => {
//             scene.remove(mesh);
//             mesh.geometry.dispose();
//             material.dispose();
//         };
//     }, [scene, radius, position]);

//     return null; // This component does not render anything in the DOM
// };

// export default TradeIndicator;


// // example usage


// // <TradeIndicator 
// //   scene={yourThreeJsScene} 
// //   price={price}
// //   size={size}
// //   side={side}
// //   radius={radius}
// //   position={[x, y, z]} 
// // />




// // Key Points:

// // useEffect Hook: The useEffect hook is used to initialize the Three.js mesh when the component mounts and clean up when it unmounts. This is similar to the constructor and destroy method in your original class.
// // Ref Hook: useRef is used to keep a reference to the Three.js mesh. It's necessary because the mesh is not part of React's render flow.
// // Props: The component receives all necessary data (like scene, price, size, side, radius, position) as props from its parent.
// // No DOM Rendering: The component returns null because it doesn't render anything directly in the DOM; it only manipulates the Three.js scene.
// // This conversion assumes you have a way to pass the Three.js scene object and other parameters (price, size, side, radius, position) to the TradeIndicator component. You might need to adapt this example to fit into your overall app architecture and state management approach.
