import { XAIClient, XAIError } from './xai-client';
import { 
  ImageGenerationRequest, 
  ImageGenerationResponse, 
  AspectRatio,
  ImageData 
} from './types';

const IMAGE_MODEL = 'grok-2-image-1212';

export interface GenerateImagesParams {
  prompt: string;
  count: number;
  aspectRatio?: AspectRatio;
}

export interface GeneratedImage {
  url?: string;
  base64?: string;
  revisedPrompt?: string;
}

export class ImageAPI {
  private client: XAIClient;

  constructor(client: XAIClient) {
    this.client = client;
  }

  async generateImages(params: GenerateImagesParams): Promise<GeneratedImage[]> {
    const request: ImageGenerationRequest = {
      prompt: params.prompt,
      model: IMAGE_MODEL,
      n: params.count,
      response_format: 'url',
    };

    if (params.aspectRatio) {
      request.aspect_ratio = params.aspectRatio;
    }

    try {
      const response: ImageGenerationResponse = await this.client.generateImages(request);
      
      return response.data.map((item: ImageData) => ({
        url: item.url,
        base64: item.b64_json,
        revisedPrompt: item.revised_prompt,
      }));
    } catch (error) {
      if (error instanceof XAIError) {
        throw this.handleXAIError(error);
      }
      throw error;
    }
  }

  private handleXAIError(error: XAIError): Error {
    switch (error.httpStatus) {
      case 401:
        return new Error('Invalid API Key. Please check your xAI API key in settings.');
      case 429:
        return new Error('Rate limit exceeded. Please wait a moment and try again.');
      case 400:
        if (error.message.includes('content policy')) {
          return new Error('Content policy violation. Please modify your prompt.');
        }
        return new Error(`Bad request: ${error.message}`);
      case 500:
      case 502:
      case 503:
        return new Error('xAI server error. Please try again later.');
      default:
        return new Error(`API Error: ${error.message}`);
    }
  }
}
