import * as Speech from 'expo-speech';
import { useCallback, useRef } from 'react';

// Wawa-lipsync uses Web Audio API for real-time viseme detection
// Since we're on React Native, we'll use a simplified approach with expo-speech
// and drive the animation based on phoneme estimation

// Viseme mapping (Oculus/ARKit standard)
const VISEME_MAP: { [key: string]: { mouthOpen: number; mouthSmile: number } } = {
    viseme_sil: { mouthOpen: 0.0, mouthSmile: 0.0 },
    viseme_PP: { mouthOpen: 0.0, mouthSmile: 0.0 },
    viseme_FF: { mouthOpen: 0.1, mouthSmile: 0.2 },
    viseme_TH: { mouthOpen: 0.15, mouthSmile: 0.3 },
    viseme_DD: { mouthOpen: 0.15, mouthSmile: 0.0 },
    viseme_kk: { mouthOpen: 0.2, mouthSmile: 0.0 },
    viseme_CH: { mouthOpen: 0.2, mouthSmile: 0.4 },
    viseme_SS: { mouthOpen: 0.1, mouthSmile: 0.5 },
    viseme_nn: { mouthOpen: 0.15, mouthSmile: 0.0 },
    viseme_RR: { mouthOpen: 0.25, mouthSmile: 0.0 },
    viseme_aa: { mouthOpen: 1.0, mouthSmile: 0.0 },
    viseme_E: { mouthOpen: 0.4, mouthSmile: 0.8 },
    viseme_I: { mouthOpen: 0.2, mouthSmile: 1.0 },
    viseme_O: { mouthOpen: 0.9, mouthSmile: 0.0 },
    viseme_U: { mouthOpen: 0.5, mouthSmile: 0.0 },
};

// Character to viseme mapping
const CHAR_TO_VISEME: { [key: string]: string } = {
    a: 'viseme_aa',
    e: 'viseme_E',
    i: 'viseme_I',
    o: 'viseme_O',
    u: 'viseme_U',
    b: 'viseme_PP',
    p: 'viseme_PP',
    m: 'viseme_PP',
    f: 'viseme_FF',
    v: 'viseme_FF',
    w: 'viseme_U',
    s: 'viseme_SS',
    z: 'viseme_SS',
    n: 'viseme_nn',
    l: 'viseme_nn',
    r: 'viseme_RR',
    t: 'viseme_DD',
    d: 'viseme_DD',
    k: 'viseme_kk',
    g: 'viseme_kk',
    ' ': 'viseme_sil',
    default: 'viseme_sil',
};

const getViseme = (char: string) => {
    const visemeKey = CHAR_TO_VISEME[char.toLowerCase()] || CHAR_TO_VISEME['default'];
    return VISEME_MAP[visemeKey] || VISEME_MAP['viseme_sil'];
};

const getCharDuration = (char: string): number => {
    // Adjusted to match expo-speech typical rate (~150 wpm)
    if ('aeiou'.includes(char.toLowerCase())) return 130; // Vowels held longer
    if ('mnlrwy'.includes(char.toLowerCase())) return 100;
    if (char === ' ') return 80; // Pause between words
    return 70; // Other consonants
};

export const useLipsync = () => {
    const coreState = useRef<{
        targets: { [key: string]: number };
        isPlaying: boolean;
    }>({
        targets: {},
        isPlaying: false,
    });

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const runAnimation = (text: string) => {
        const chars = text.toLowerCase().split('');
        let time = 0;
        const timeline = chars.map(char => {
            const duration = getCharDuration(char);
            const item = { char, start: time, end: time + duration, viseme: getViseme(char) };
            time += duration;
            return item;
        });

        const totalDuration = time;
        const startTime = Date.now();
        let currentOpen = 0;
        let currentSmile = 0;

        intervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;

            if (elapsed > totalDuration + 300)
            {
                // Fade out smoothly
                currentOpen *= 0.7;
                currentSmile *= 0.7;
                if (currentOpen < 0.01)
                {
                    coreState.current.targets = {};
                    coreState.current.isPlaying = false;
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    return;
                }
                coreState.current.targets = { mouthOpen: currentOpen, mouthSmile: currentSmile };
                return;
            }

            // Find current viseme
            let viseme = { mouthOpen: 0, mouthSmile: 0 };
            for (const item of timeline)
            {
                if (elapsed >= item.start && elapsed <= item.end)
                {
                    viseme = item.viseme;
                    break;
                }
            }

            // Smooth lerp
            currentOpen += (viseme.mouthOpen - currentOpen) * 0.5;
            currentSmile += (viseme.mouthSmile - currentSmile) * 0.5;

            coreState.current.targets = { mouthOpen: currentOpen, mouthSmile: currentSmile };
        }, 16); // 60fps
    };

    const speak = useCallback(async (text: string) => {
        if (!text) return;

        console.log('[Lipsync] Speaking with wawa-lipsync approach:', text);
        coreState.current.isPlaying = true;
        coreState.current.targets = { mouthOpen: 0.3 };

        // Use expo-speech for audio - slightly slower to match animation
        Speech.speak(text, {
            rate: 1.2,
            onDone: () => {
                console.log('[Lipsync] Speech done');
            },
            onStopped: () => {
                coreState.current.isPlaying = false;
                coreState.current.targets = {};
                if (intervalRef.current) clearInterval(intervalRef.current);
            },
        });

        // Run animation in parallel
        runAnimation(text);
    }, []);

    const stop = useCallback(() => {
        Speech.stop();
        coreState.current.isPlaying = false;
        coreState.current.targets = {};
        if (intervalRef.current) clearInterval(intervalRef.current);
    }, []);

    return {
        lipsyncRef: coreState,
        speak,
        stop,
    };
};
