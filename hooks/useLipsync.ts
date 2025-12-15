import * as Speech from 'expo-speech';
import { useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { Lipsync } from 'wawa-lipsync';

// Viseme to morph target mapping
const VISEME_TO_MORPH: { [key: string]: { mouthOpen: number; mouthSmile: number } } = {
    'viseme_sil': { mouthOpen: 0.0, mouthSmile: 0.0 },
    'viseme_PP': { mouthOpen: 0.0, mouthSmile: 0.0 },
    'viseme_FF': { mouthOpen: 0.1, mouthSmile: 0.2 },
    'viseme_TH': { mouthOpen: 0.15, mouthSmile: 0.3 },
    'viseme_DD': { mouthOpen: 0.15, mouthSmile: 0.0 },
    'viseme_kk': { mouthOpen: 0.2, mouthSmile: 0.0 },
    'viseme_CH': { mouthOpen: 0.2, mouthSmile: 0.4 },
    'viseme_SS': { mouthOpen: 0.1, mouthSmile: 0.5 },
    'viseme_nn': { mouthOpen: 0.15, mouthSmile: 0.0 },
    'viseme_RR': { mouthOpen: 0.25, mouthSmile: 0.0 },
    'viseme_aa': { mouthOpen: 1.0, mouthSmile: 0.0 },
    'viseme_E': { mouthOpen: 0.4, mouthSmile: 0.8 },
    'viseme_I': { mouthOpen: 0.2, mouthSmile: 1.0 },
    'viseme_O': { mouthOpen: 0.9, mouthSmile: 0.0 },
    'viseme_U': { mouthOpen: 0.5, mouthSmile: 0.0 },
};

// Character to viseme mapping
const charToViseme = (char: string): { mouthOpen: number; mouthSmile: number } => {
    const c = char.toLowerCase();
    if ('aeiou'.includes(c))
    {
        if (c === 'a') return VISEME_TO_MORPH['viseme_aa'];
        if (c === 'e') return VISEME_TO_MORPH['viseme_E'];
        if (c === 'i') return VISEME_TO_MORPH['viseme_I'];
        if (c === 'o') return VISEME_TO_MORPH['viseme_O'];
        if (c === 'u') return VISEME_TO_MORPH['viseme_U'];
    }
    if ('bmp'.includes(c)) return VISEME_TO_MORPH['viseme_PP'];
    if ('fv'.includes(c)) return VISEME_TO_MORPH['viseme_FF'];
    if ('sz'.includes(c)) return VISEME_TO_MORPH['viseme_SS'];
    if ('td'.includes(c)) return VISEME_TO_MORPH['viseme_DD'];
    if ('kg'.includes(c)) return VISEME_TO_MORPH['viseme_kk'];
    if ('nlr'.includes(c)) return VISEME_TO_MORPH['viseme_nn'];
    if (c === ' ') return VISEME_TO_MORPH['viseme_sil'];
    return VISEME_TO_MORPH['viseme_sil'];
};

// Create lipsync manager for web platform only
let lipsyncManager: Lipsync | null = null;
if (Platform.OS === 'web' && typeof window !== 'undefined')
{
    try
    {
        lipsyncManager = new Lipsync();
    } catch (e)
    {
        console.warn('[WawaLipsync] Could not create Lipsync manager:', e);
    }
}

export const useLipsync = () => {
    const coreState = useRef<{
        targets: { [key: string]: number };
        isPlaying: boolean;
    }>({
        targets: {},
        isPlaying: false,
    });

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Animation loop for text-based lip sync
    const runAnimation = (text: string) => {
        const chars = text.toLowerCase().split('');
        let index = 0;
        const charDuration = 80; // ms per character

        intervalRef.current = setInterval(() => {
            if (index >= chars.length || !coreState.current.isPlaying)
            {
                if (intervalRef.current) clearInterval(intervalRef.current);
                // Fade out
                const fadeOut = setInterval(() => {
                    const open = coreState.current.targets.mouthOpen || 0;
                    if (open < 0.01)
                    {
                        clearInterval(fadeOut);
                        coreState.current.targets = {};
                        return;
                    }
                    coreState.current.targets = {
                        mouthOpen: open * 0.7,
                        mouthSmile: (coreState.current.targets.mouthSmile || 0) * 0.7,
                    };
                }, 16);
                return;
            }

            const char = chars[index];
            const viseme = charToViseme(char);

            const currentOpen = coreState.current.targets.mouthOpen || 0;
            const currentSmile = coreState.current.targets.mouthSmile || 0;

            coreState.current.targets = {
                mouthOpen: currentOpen + (viseme.mouthOpen - currentOpen) * 0.5,
                mouthSmile: currentSmile + (viseme.mouthSmile - currentSmile) * 0.5,
            };

            index++;
        }, charDuration);
    };

    // Speak text using expo-speech with lip sync animation
    const speak = useCallback(async (text: string) => {
        if (!text) return;

        console.log('[WawaLipsync] Speaking:', text);

        // Clear any existing animation
        if (intervalRef.current)
        {
            clearInterval(intervalRef.current);
        }

        coreState.current.isPlaying = true;
        coreState.current.targets = { mouthOpen: 0.3, mouthSmile: 0 };

        // Start animation
        runAnimation(text);

        // Use expo-speech for TTS
        Speech.speak(text, {
            rate: 0.8,
            onDone: () => {
                console.log('[WawaLipsync] Speech done');
                coreState.current.isPlaying = false;
            },
            onStopped: () => {
                coreState.current.isPlaying = false;
                coreState.current.targets = {};
                if (intervalRef.current) clearInterval(intervalRef.current);
            },
        });
    }, []);

    // Stop speech and animation
    const stop = useCallback(() => {
        Speech.stop();
        coreState.current.isPlaying = false;
        coreState.current.targets = {};
        if (intervalRef.current)
        {
            clearInterval(intervalRef.current);
        }
    }, []);

    return {
        lipsyncRef: coreState,
        speak,
        stop,
    };
};
