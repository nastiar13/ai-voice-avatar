import { Environment, OrbitControls, PerspectiveCamera } from '@react-three/drei/native';
import { Canvas } from '@react-three/fiber/native';
import React, { Suspense } from 'react';
import { StyleSheet, View } from 'react-native';

interface SceneContainerProps {
    children?: React.ReactNode;
}

export const SceneContainer: React.FC<SceneContainerProps> = ({ children }) => {
    return (
        <View style={styles.container}>
            <Canvas
                shadows
                gl={{ localClippingEnabled: true }}
            >
                <PerspectiveCamera makeDefault position={[0, 0.2, 3]} fov={50} />
                <OrbitControls enablePan={false} />

                <ambientLight intensity={0.5} />
                <directionalLight
                    position={[5, 10, 5]}
                    intensity={1.5}
                    castShadow
                    shadow-mapSize={[1024, 1024]}
                />

                <Suspense fallback={null}>
                    {children}
                    <Environment preset="city" />
                </Suspense>
            </Canvas>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111', // Dark background for contrast
    },
});
