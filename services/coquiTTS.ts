// Coqui TTS Service - Local Docker-based TTS
// Endpoint: http://localhost:5002/api/tts

// Change this to your Docker host IP if running on a different machine
const COQUI_TTS_URL = 'http://localhost:5002/api/tts';

export interface CoquiTTSResponse {
    audioBase64: string;
}

export interface SynthesizeOptions {
    text: string;
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
 * Synthesize speech using local Coqui TTS Docker server
 */
export const synthesizeSpeech = async (options: SynthesizeOptions): Promise<CoquiTTSResponse> => {
    const { text } = options;

    try
    {
        console.log('[CoquiTTS] Calling local server...');

        // Coqui TTS API expects text as query parameter
        const url = `${COQUI_TTS_URL}?text=${encodeURIComponent(text)}`;

        const response = await fetch(url, {
            method: 'GET',
        });

        console.log('[CoquiTTS] Response status:', response.status);

        if (!response.ok)
        {
            const errorText = await response.text();
            console.error('[CoquiTTS] Error:', errorText);
            throw new Error(`Coqui TTS failed: ${response.status}`);
        }

        // Response is audio bytes (WAV)
        const audioBuffer = await response.arrayBuffer();
        const audioBase64 = arrayBufferToBase64(audioBuffer);

        console.log('[CoquiTTS] Audio received, length:', audioBase64.length);

        return {
            audioBase64,
        };
    } catch (error)
    {
        console.error('[CoquiTTS] Error:', error);
        throw error;
    }
};
