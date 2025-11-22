
const CLIENT_ID = Deno.env.get('CLOVA_CLIENT_ID');
const CLIENT_SECRET = Deno.env.get('CLOVA_STT_SECRET') || Deno.env.get('CLOVA_CLIENT_SECRET');
const language = 'Eng'; // Standard language code for English

export async function speedToTextAPI(
  audioData: ArrayBuffer
): Promise<{ text: string } | null> {
  try {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.error('❌ Missing CLOVA credentials');
      return null;
    }

    const response = await fetch(
      `https://naveropenapi.apigw.ntruss.com/recog/v1/stt?lang=${language}`,
      {
        method: 'POST',
        headers: {
          'X-NCP-APIGW-API-KEY-ID': CLIENT_ID,
          'X-NCP-APIGW-API-KEY': CLIENT_SECRET,
          'Content-Type': 'application/octet-stream',
        },
        body: audioData,
      }
    );

    if (!response.ok) {
      const raw = await response.text();
      console.error('❌ Clova STT error:', response.status, response.statusText);
      console.error('Details:', raw);
      return null;
    }

    const json = await response.json();
    if (!json.text) return null;

    return { text: json.text };
  } catch (e: any) {
    console.error('❌ Error:', e.message);
    return null;
  }
}

