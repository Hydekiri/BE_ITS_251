import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';

@Injectable()
export class AiService {
  private apiKey = process.env.GEMINI_API_KEY;

  // Simple helper that would call external AI API. Currently returns a stub when API key is missing.
  async generateSummary(text: string): Promise<string> {
    if (!this.apiKey) {
      return `SUMMARY: ${text.slice(0, 200)}${text.length > 200 ? '...' : ''}`;
    }

    // Example POST to a hypothetical Gemini endpoint (replace with real endpoint)
    try {
      const res = await fetch('https://api.example.com/v1/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
        body: JSON.stringify({ input: text }),
      });
      const json: any = await res.json();
      return json?.output ?? (text.slice(0, 200) + '...');
    } catch (err) {
      return `SUMMARY: ${text.slice(0, 200)}${text.length > 200 ? '...' : ''}`;
    }
  }
}
