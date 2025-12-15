import { useGLTF } from '@react-three/drei/native';
import { useFrame } from '@react-three/fiber/native';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Default Ready Player Me avatar for testing
const DEFAULT_AVATAR_URL = 'https://models.readyplayer.me/693fe16fd7e4ffac81fa95e5.glb';

interface AvatarProps {
    url?: string;
    onLoaded?: (nodes: any) => void;
    lipsyncRef?: React.MutableRefObject<{
        targets: { [key: string]: number };
        isPlaying: boolean;
    }>;
    setDebug?: (msg: string) => void;
}

export const Avatar: React.FC<AvatarProps> = ({ url = DEFAULT_AVATAR_URL, onLoaded, lipsyncRef, setDebug }) => {
    const { scene, nodes } = useGLTF(url);
    const morphMeshesRef = useRef<THREE.SkinnedMesh[]>([]);

    useEffect(() => {
        morphMeshesRef.current = []; // Reset

        scene.traverse((child) => {
            if ((child as THREE.SkinnedMesh).isSkinnedMesh && (child as THREE.SkinnedMesh).morphTargetDictionary)
            {
                console.log('Adding morph mesh:', child.name);
                morphMeshesRef.current.push(child as THREE.SkinnedMesh);
            }
        });

        // Debug info on screen
        if (setDebug)
        {
            if (morphMeshesRef.current.length > 0)
            {
                const keys = Object.keys(morphMeshesRef.current[0].morphTargetDictionary!).slice(0, 3).join(',');
                setDebug(`Controlling ${morphMeshesRef.current.length} meshes (${keys})`);
            } else
            {
                setDebug('Fatal: No morph targets found on model!!');
            }
        }

        if (onLoaded)
        {
            onLoaded(nodes);
        }
    }, [scene, nodes, onLoaded]);

    useFrame((state, delta) => {
        // Report status via setDebug prop if available
        if (setDebug && lipsyncRef?.current.isPlaying)
        {
            const count = morphMeshesRef.current.length;
            // Show active targets (first 2 for brevity)
            const active = JSON.stringify(lipsyncRef.current.targets).slice(0, 30);
            setDebug(`[${count}m] ${active}`);
        }

        if (morphMeshesRef.current.length === 0) return;

        const targets = (lipsyncRef && lipsyncRef.current.isPlaying) ? lipsyncRef.current.targets : {};

        morphMeshesRef.current.forEach(mesh => {
            if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;

            const dict = mesh.morphTargetDictionary;
            const influences = mesh.morphTargetInfluences;

            for (const key in dict)
            {
                const idx = dict[key];
                const targetValue = targets[key] || 0;
                // Very fast lerp for responsive animation
                influences[idx] = THREE.MathUtils.lerp(influences[idx], targetValue, 0.8);
            }
        });
    });

    return <primitive object={scene} position={[0, -1.5, 0]} />;
};

// Preload the default model for performance
useGLTF.preload(DEFAULT_AVATAR_URL);
