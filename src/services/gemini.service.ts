
import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY'] || '' });
  }

  async generateQuote(): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Generate a short, inspiring, deep philosophical quote about transparency, glass, or clarity. Max 20 words. No author name.',
      });
      return response.text.trim();
    } catch (error) {
      console.error('Error generating quote:', error);
      return 'Clarity comes from within.';
    }
  }

  async generateWallpaper(prompt: string): Promise<string | null> {
    try {
      const response = await this.ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `Abstract glassmorphism wallpaper, ${prompt}, high quality, 8k, soft lighting, translucent textures, colorful gradients`,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '9:16',
        },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
      }
      return null;
    } catch (error) {
      console.error('Error generating wallpaper:', error);
      return null;
    }
  }
}
