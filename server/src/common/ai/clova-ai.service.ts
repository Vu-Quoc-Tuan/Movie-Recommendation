import { Injectable } from '@nestjs/common';

const CLOVA_URL =
    'https://clovastudio.stream.ntruss.com/testapp/v1/chat-completions/HCX-DASH-001';

const SYSTEM_PROMPT = `You are a mood analyzer for movies.

Your task:
- Read the user's input (their current feeling, what they want to watch).
- Analyze and choose mood tags ONLY from the list below.

Available mood tags:
["happy", "funny", "sad", "dark", "lonely", "warm", "healing", "romantic", "excited", "tense", "thrilling", "scary", "mysterious", "nostalgic", "cozy", "chaotic"]

Output STRICT JSON:
{
  "mood_tags": [...],
  "top_3": [...],
  "confidence": 0.0-1.0
}

Rules:
- mood_tags: 3-6 tags from the list that fit the user's mood.
- top_3: the 3 most important moods. If not confident, choose fewer than 3.
- Do NOT invent new mood words outside the list.
- Answer with pure JSON only.`;

const PARTY_MODE_PROMPT = `
You are a mood analyzer for movies.

This time, the input comes from *multiple people* (a group of 2–4 members).
Each member will describe:
- Their current feeling
- The type of movie they want to watch

Your task:
- Read ALL members' inputs.
- Identify each person's individual moods.
- Compute the *intersection*, *overlap*, or *collective blend* of group emotions.
- Then generate mood_tags and top_3 that best represent the group's shared emotional direction.

Available mood tags:
["happy", "funny", "sad", "dark", "lonely", "warm", "healing", "romantic", "excited", "tense", "thrilling", "scary", "mysterious", "nostalgic", "cozy", "chaotic"]

Output STRICT JSON:
{
  "mood_tags": [...],
  "top_3": [...],
  "confidence": 0.0-1.0
}

Rules:
- mood_tags: 3–6 tags from the list that fit the *group's combined mood*.
- top_3: the 3 most important moods. If not confident, choose fewer than 3.
- Do NOT invent new mood words outside the list.
- Answer with pure JSON only.

Additional group rules for Party Mode:
- If multiple members share a common mood, prioritize that mood.
- If their emotions differ, generate a blended set that best fits all members.
- Avoid extremes unless at least half the group expresses that feeling.
- Confidence should reflect how aligned the group is emotionally:
  - High overlap → 0.8–1.0
  - Medium overlap → 0.5–0.79
  - Very different moods → 0.3–0.49

`;

const SYSTEM_PROMPT_SCORE_MOVIE = `You are a movie-mood matching engine

Your task:
- Read the following:
    + The user's mood input (what they currently feel and what they want to watch).
    + The movie information
- Evaluate how well the movie matches what the user is looking for.
- Produce a relevance score.

Output STRICT JSON:
{
  "match_score": 0.0,
  "reason": "",
  "confidence": 0.0
}

Rules:
- match_score: float between 0 and 100 (higher is better).
- reason: brief explanation of why you gave that score (not too long).
- confidence: float between 0 and 1 indicating how confident you are in your score.
- Return pure JSON only, no extra text.`;

const SYSTEM_PROMPT_SCORE_CHARACTER = `You are a character-extraction and matching engine

Your task:
- Read the following:
    + The user's input (their personality traits, current situation, preferences, or what they are looking for in a character).
    + The movie information (title, genre, overview/description, year, etc.).
- From the movie information, identify the main character(s) and describe their personality, traits, and behavior.
- Evaluate how well the main character(s) fits the user's input and context.
- Produce a relevance score and include the main character's name and traits if possible.

Output STRICT JSON:
{
  "character_name": "",
  "character_traits": "",
  "match_score": 0.0,
  "reason": "",
  "confidence": 0.0
}

Rules:
- character_name: the name of the main character(s) (if available).
- character_traits: a brief description of the character's personality and behavior.
- match_score: float between 0 and 100 (higher is better).
- reason: brief explanation of why you gave that score (not too long).
- confidence: float between 0 and 1 indicating how confident you are in your score.
- Return pure JSON only, no extra text.

`;

@Injectable()
export class ClovaAIService {
    private readonly clovaApiKey: string;

    constructor() {
        this.clovaApiKey = process.env.CLOVA_API_KEY!;
    }

    async callClovaMood(text: string, mode?: 'party' | 'single'): Promise<any> {
        const systemPrompt = mode === 'party' ? PARTY_MODE_PROMPT : SYSTEM_PROMPT;

        const body = {
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: text },
            ],
            topP: 0.8,
            topK: 0,
            maxTokens: 256,
            temperature: 0.3,
            repeatPenalty: 5.0,
            includeAiFilters: true,
            seed: 0,
        };

        const response = await fetch(CLOVA_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.clovaApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            console.error('❌ Clova error:', response.status, response.statusText);
            const err = await response.text();
            console.error('Error details:', err);
            throw new Error('Clova request failed');
        }

        const result = await response.json();

        const content = result?.result?.message?.content;
        if (!content) throw new Error('No content returned from Clova');

        return JSON.parse(content); // { mood_tags, top_3, confidence }
    }

    async apiHelper(userInput: string, taskAI: number): Promise<any> {
        let SYSTEM_PROMPT = '';
        switch (taskAI) {
            case 1:
                SYSTEM_PROMPT = SYSTEM_PROMPT_SCORE_MOVIE;
                break;
            default:
                SYSTEM_PROMPT = SYSTEM_PROMPT_SCORE_CHARACTER;
        }

        const requestBody = {
            messages: [
                {
                    role: 'system',
                    content: SYSTEM_PROMPT,
                },
                {
                    role: 'user',
                    content: userInput,
                },
            ],
            topP: 0.8,
            topK: 0,
            maxTokens: 256,
            temperature: 0.3,
            repeatPenalty: 5.0,
            stopBefore: [],
            includeAiFilters: true,
            seed: 0,
        };

        try {
            const response = await fetch(CLOVA_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.clovaApiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Clova API error:', response.status, response.statusText);
                console.error('Error details:', errorText);
                return null;
            }

            const result = await response.json();
            console.log('📦 Full response:', JSON.stringify(result, null, 2));

            if (result.status?.code !== '20000') {
                console.error('❌ API returned error:', result.status?.message);
                return null;
            }

            const content = result.result?.message?.content;

            if (!content) {
                console.error('❌ No content in response');
                return null;
            }
            const parsed = JSON.parse(content);

            return parsed;
        } catch (error: any) {
            console.error('❌ Error calling Clova:', error.message);
            console.error('Stack:', error.stack);
            return null;
        }
    }
}