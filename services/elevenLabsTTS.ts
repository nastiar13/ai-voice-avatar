// ElevenLabs TTS Service with character-level alignment
// Provides precise timing data for lipsync

const ELEVENLABS_API_KEY = 'sk_ca5064eaab85efa113693eed7e9c47461aafa73b4c007568';
const ELEVENLABS_VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb'; // User's chosen voice

export interface CharacterAlignment {
    character: string;
    start_time: number;
    end_time: number;
}

export interface ElevenLabsResponse {
    audioBase64: string;
    alignment: CharacterAlignment[];
}

export interface SynthesizeOptions {
    text: string;
    voiceId?: string;
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
 * Synthesize speech using ElevenLabs with character-level alignment
 */
export const synthesizeSpeech = async (options: SynthesizeOptions): Promise<ElevenLabsResponse> => {
    const { text, voiceId = ELEVENLABS_VOICE_ID } = options;

    // Try the with-timestamps endpoint first
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`;

    const requestBody = {
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
        },
    };

    try
    {
        console.log('[ElevenLabs] Calling API with key:', ELEVENLABS_API_KEY.substring(0, 10) + '...');

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY,
            },
            body: JSON.stringify(requestBody),
        });

        console.log('[ElevenLabs] Response status:', response.status);

        if (!response.ok)
        {
            const errorText = await response.text();
            console.error('[ElevenLabs] Error response:', errorText);

            // If with-timestamps fails, try the basic endpoint
            if (response.status === 401 || response.status === 403)
            {
                console.log('[ElevenLabs] Trying basic endpoint...');
                return await synthesizeSpeechBasic(options);
            }

            throw new Error(`ElevenLabs failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('[ElevenLabs] Response received, keys:', Object.keys(data));

        // Extract audio and alignment
        const audioBase64 = data.audio_base64;
        const alignmentData = data.alignment;

        const alignment: CharacterAlignment[] = [];
        if (alignmentData && alignmentData.characters)
        {
            for (let i = 0; i < alignmentData.characters.length; i++)
            {
                alignment.push({
                    character: alignmentData.characters[i],
                    start_time: alignmentData.character_start_times_seconds[i] * 1000,
                    end_time: alignmentData.character_end_times_seconds[i] * 1000,
                });
            }
        }

        console.log('[ElevenLabs] Got', alignment.length, 'character alignments');

        return { audioBase64, alignment };
    } catch (error)
    {
        console.error('[ElevenLabs] Error:', error);
        throw error;
    }
};

/**
 * Basic TTS endpoint (without timestamps) as fallback
 */
const synthesizeSpeechBasic = async (options: SynthesizeOptions): Promise<ElevenLabsResponse> => {
    const { text, voiceId = ELEVENLABS_VOICE_ID } = options;

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    const requestBody = {
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
        },
    };

    console.log('[ElevenLabs] Trying basic endpoint...');

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify(requestBody),
    });

    console.log('[ElevenLabs] Basic endpoint status:', response.status);

    if (!response.ok)
    {
        const errorText = await response.text();
        console.error('[ElevenLabs] Basic endpoint error:', errorText);
        throw new Error(`ElevenLabs basic failed: ${response.status}`);
    }

    // Response is audio bytes, not JSON
    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = arrayBufferToBase64(audioBuffer);

    console.log('[ElevenLabs] Got audio, length:', audioBase64.length);

    // No alignment data from basic endpoint
    return { audioBase64, alignment: [] };
};
