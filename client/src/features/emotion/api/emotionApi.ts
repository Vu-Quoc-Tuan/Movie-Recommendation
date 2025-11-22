import type {
    JourneyResult,
    CharacterMatchResult,
    PartyMoodMember,
    PartyMoodResponse,
} from '../types/emotion.types';
import {getApiEndpoint} from "../../../lib/api/apiClient";

/**
 * Gọi API phân tích liệu trình cảm xúc từ văn bản
 */
export async function analyzeEmotionalJourney(moodText: string): Promise<JourneyResult> {
    const response = await fetch(getApiEndpoint('/analyze-emotional-journey'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ moodText }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to analyze emotional journey');
    }

    return response.json();
}

/**
 * Gọi API tìm nhân vật phù hợp với cảm xúc hiện tại
 */
export async function analyzeCharacterMatch(moodText: string): Promise<CharacterMatchResult> {
    const response = await fetch(getApiEndpoint('/analyze-character-match'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            },
        body: JSON.stringify({ moodText }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to analyze character match');
    }

    return response.json();
}

/**
 * Gọi API phân tích mood nhóm và trả về gợi ý phim
 */
export async function analyzePartyMood(members: PartyMoodMember[]): Promise<PartyMoodResponse> {
    const response = await fetch(getApiEndpoint('/analyze-party-mood'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ members }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to analyze party mood');
    }

    return response.json();
}

/**
 * Gọi API chuyển đổi giọng nói thành văn bản (STT)
 */
export async function transcribeAudio(audioBlob: Blob): Promise<{ text: string }> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');

    const response = await fetch(getApiEndpoint('stt'), {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to transcribe audio');
    }

    return response.json();
}