// Piper TTS Service - Local Docker-based TTS
// Uses arunk140/serve-piper-tts Docker image
// Endpoint: http://localhost:5000/tts

const PIPER_TTS_URL = 'http://localhost:5000/tts';

export interface PiperTTSResponse {
    audioBase64: string;
}

export interface SynthesizeOptions {
    text: string;
    voice?: string;
}

/**
 * Convert ArrayBuffer to Base64 string
 */
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++)
    {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

/**
 * Synthesize speech using local Piper TTS Docker server
 */
export const synthesizeSpeech = async (options: SynthesizeOptions): Promise<PiperTTSResponse> => {
    const { text, voice = 'en_US-lessac-medium' } = options;

    try
    {
        console.log('[PiperTTS] Calling local server...');

        const response = await fetch(PIPER_TTS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                voice: voice,
            }),
        });

        console.log('[PiperTTS] Response status:', response.status);

        if (!response.ok)
        {
            const errorText = await response.text();
            console.error('[PiperTTS] Error:', errorText);
            throw new Error(`Piper TTS failed: ${response.status}`);
        }

        // Response is audio bytes (WAV)
        const audioBuffer = await response.arrayBuffer();
        const audioBase64 = arrayBufferToBase64(audioBuffer);

        console.log('[PiperTTS] Audio received, length:', audioBase64.length);

        return {
            audioBase64,
        };
    } catch (error)
    {
        console.error('[PiperTTS] Error:', error);
        throw error;
    }
};
