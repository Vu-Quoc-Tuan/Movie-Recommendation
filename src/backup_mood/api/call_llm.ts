import 'dotenv/config';

const CLOVA_API_KEY = process.env.CLOVA_API_KEY!;

const SYSTEM_PROMPT = `You are a movie mood annotator used in a project called "Movie Mood Matcher".

Your task:
- Read the movie information (title, genres, overview).
- Infer what kind of emotional experience the audience will have when watching this movie.
- Choose mood tags ONLY from the list below.

Available mood tags:
["happy", "funny", "sad", "dark", "lonely", "warm", "healing", "romantic", "excited", "tense", "thrilling", "scary", "mysterious", "nostalgic", "cozy", "chaotic"]

Output STRICT JSON:
{
  "mood_tags": [...],
  "top_3": [...],
  "confidence": 0.0-1.0
}

Rules:
- mood_tags: tags from the list that fit the movie.
- top_3: the 3 most important moods (subset of mood_tags) (can be fewer than 3 but more than 1).
- Do NOT invent new mood words outside the list.
- Answer with pure JSON only. NO extra text.`;


export async function callllm(request: Request): Promise<Response> {
  const movieInfo = await request.text();

  const requestBody = {
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT
      },
      {
        role: "user", 
        content: movieInfo
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
    return new Response(JSON.stringify({ error: 'LLM failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const result = await response.json();
  console.log('📦 Full response:', JSON.stringify(result, null, 2));

  if (result.status?.code !== '20000') {
    console.error('❌ API returned error:', result.status?.message);
    return new Response(JSON.stringify({ error: 'LLM failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const content = result.result?.message?.content;
  
  if (!content) {
    console.error('❌ No content in response');
    return new Response(JSON.stringify({ error: 'LLM failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  const parsed = JSON.parse(content);
  
  return new Response(JSON.stringify(parsed), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export default callllm;