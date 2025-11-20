import 'dotenv/config';

const CLOVA_API_KEY = process.env.CLOVA_API_KEY!;

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

export async function moodAPI(userInput: string): Promise<{ mood_tags: string[], top_3: string[], confidence: number } | null> {
  
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

export default moodAPI;