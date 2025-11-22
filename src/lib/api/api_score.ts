import 'dotenv/config';

// 1 - Movie Mood Analyze score
// 2 - 

const CLOVA_API_KEY = process.env.CLOVA_API_KEY!;

export async function apiHelper(userInput: string, taskAI: number): Promise<any> {
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
                role: "system",
                content: SYSTEM_PROMPT
            },
            {
                role: "user",
                content: userInput
            }
        ],
        topP: 0.8,
        topK: 0,
        maxTokens: 256,
        temperature: 0.3,
        repeatPenalty: 5.0,
        stopBefore: [],
        includeAiFilters: true,
        seed: 0
    };

    try {

        const response = await fetch('https://clovastudio.stream.ntruss.com/testapp/v1/chat-completions/HCX-DASH-001', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CLOVA_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
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

`
