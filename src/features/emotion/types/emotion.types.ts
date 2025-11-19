export interface CharacterMatchResult {
    movie: {
        title: string;
        year: string;
        poster: string;
        rating: number;
        character: string;
        characterDescription: string;
        similarity: number;
        whyMatch: string;
        vignette: string;
        quote: string;
        spectrum: {
            calm: number;
            warm: number;
            hopeful: number;
            nostalgic: number;
            bittersweet: number;
            intense: number;
        };
    };
}

export interface EmotionSpectrum {
    calm: number;
    warm: number;
    hopeful: number;
    nostalgic: number;
    bittersweet: number;
    intense: number;
}

export interface JourneyStep {
    title: string;
    year: string;
    poster: string;
    vignette: string;
    quote: string;
    spectrum: EmotionSpectrum;
}

export interface JourneyResult {
    release: JourneyStep;
    reflect: JourneyStep;
    rebuild: JourneyStep;
}

export interface CharacterMatchResult {
    movie: {
        title: string;
        year: string;
        poster: string;
        rating: number;
        character: string;
        characterDescription: string;
        similarity: number;
        whyMatch: string;
        vignette: string;
        quote: string;
        spectrum: EmotionSpectrum;
    };
}

export interface PartyRecommendation {
    id: number | string;
    title: string;
    year: string;
    poster: string;
    vibes: string[];
    rating: number;
    matchScore: number;
    reason: string;
}

    export interface PartyMoodRequest {
    name: string;
    mood?: string;
    moodText?: string;
}
export interface PartyMoodMember {
    id: string;
    name: string;
    mood: string;
    moodText?: string;
}

export interface PartyMoodResponse {
    recommendations: PartyRecommendation[];
}