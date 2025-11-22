import { Injectable } from '@nestjs/common';

@Injectable()
export class ClovaSTTService {
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly language = 'Eng'; // Standard language code for English

    constructor() {
        this.clientId = process.env.CLOVA_CLIENT_ID || '';
        this.clientSecret = process.env.CLOVA_STT_SECRET || process.env.CLOVA_CLIENT_SECRET || '';
    }

    async speechToTextAPI(audioData: ArrayBuffer): Promise<{ text: string } | null> {
        try {
            if (!this.clientId || !this.clientSecret) {
                console.error('❌ Missing CLOVA credentials');
                return null;
            }

            const response = await fetch(
                `https://naveropenapi.apigw.ntruss.com/recog/v1/stt?lang=${this.language}`,
                {
                    method: 'POST',
                    headers: {
                        'X-NCP-APIGW-API-KEY-ID': this.clientId,
                        'X-NCP-APIGW-API-KEY': this.clientSecret,
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
}