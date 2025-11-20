import { GoogleGenAI, GenerateContentParameters } from "@google/genai";

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

const ai = new GoogleGenAI({ apiKey: "AIzaSyDz5dHC2ui1q4Egoh4XVuHF2b0TaPzjNmQ" });

export async function callllm(request: Request): Promise<Response> {
  const movieInfo = await request.text();
  
  console.log('📝 Input movie info:', movieInfo);
  
  const params: GenerateContentParameters = {
    model: "gemini-2.5-flash",
    contents: [
      { 
        role: "user", 
        parts: [
          { text: movieInfo } 
        ]
      }
    ],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      temperature: 0.3,
      maxOutputTokens: 2048,
      responseSchema: {
        type: "OBJECT",
        properties: {
          mood_tags: { 
            type: "ARRAY", 
            items: { type: "STRING" },
            minItems: 3,
            maxItems: 6
          },
          top_3: { 
            type: "ARRAY", 
            items: { type: "STRING" },
            minItems: 3,
            maxItems: 3
          },
          confidence: { type: "NUMBER" }
        },
        required: ["mood_tags", "top_3", "confidence"]
      }
    }
  };

  try {
    console.log('🔄 Calling Gemini API...');
    const response = await ai.models.generateContent(params);
    
    console.log('📦 Full response object:', JSON.stringify(response, null, 2));
    console.log('📄 response.text:', response.text);
    console.log('📄 response.candidates:', response.candidates);
    
    const candidate = response.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;
    const output = text || '';
    
    console.log('✅ Final output:', output);
    console.log('📏 Output length:', output.length);
    
    if (!output) {
      console.error('❌ Output is empty!');
      return new Response(JSON.stringify({ error: 'Empty response' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate JSON
    const parsed = JSON.parse(output);
    console.log('✅ Parsed JSON:', parsed);
    
    return new Response(output, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('❌ LLM API error:', error);
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({ error: error.message || 'LLM failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export default callllm;