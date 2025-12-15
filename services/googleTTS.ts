// Google Cloud Text-to-Speech Service

const GOOGLE_TTS_API_KEY = 'AIzaSyC3uv22ru8mlyWjPmUp3p6rbcMXWBuHDe0';
const GOOGLE_TTS_URL = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`;

export interface GoogleTTSResponse {
    audioContent: string; // Base64 encoded audio
}

export interface SynthesizeOptions {
    text: string;
    languageCode?: string;
    voiceName?: string;
    speakingRate?: number;
}

/**
 * Synthesize speech using Google Cloud TTS
 */
export const synthesizeSpeech = async (options: SynthesizeOptions): Promise<GoogleTTSResponse> => {
    const {
        text,
        languageCode = 'en-US',
        voiceName = 'en-US-Neural2-D', // High quality male voice
        speakingRate = 1.0,
    } = options;

    const requestBody = {
        input: { text },
        voice: {
            languageCode,
            name: voiceName,
        },
        audioConfig: {
            audioEncoding: 'MP3',
            speakingRate,
        },
    };

    try
    {
        console.log('[GoogleTTS] Calling API...');
        const response = await fetch(GOOGLE_TTS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        console.log('[GoogleTTS] Response status:', response.status);

        if (!response.ok)
        {
            const errorText = await response.text();
            console.error('[GoogleTTS] Error:', errorText);
            throw new Error(`Google TTS failed: ${response.status}`);
        }

        const data = await response.json();
        console.log('[GoogleTTS] Audio received, length:', data.audioContent?.length || 0);

        return {
            audioContent: data.audioContent,
        };
    } catch (error)
    {
        console.error('[GoogleTTS] Error:', error);
        throw error;
    }
};
