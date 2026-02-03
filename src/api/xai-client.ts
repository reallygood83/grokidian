import { requestUrl, RequestUrlParam } from 'obsidian';
import { 
  ImageGenerationRequest, 
  ImageGenerationResponse, 
  XAIErrorResponse 
} from './types';

const XAI_API_BASE = 'https://api.x.ai/v1';
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

export class XAIClient {
  private apiKey: string;
  private lastRequestTime: number = 0;
  private minRequestInterval: number = 100; // Rate limiting

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  async validateApiKey(): Promise<boolean> {
    if (!this.apiKey) return false;
    
    try {
      // Simple validation request
      const response = await this.makeRequest('/models', 'GET');
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async generateImages(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    return this.retryWithBackoff(async () => {
      await this.enforceRateLimit();
      
      const response = await this.makeRequest('/images/generations', 'POST', request);
      
      if (response.status !== 200) {
        const errorBody = response.json as XAIErrorResponse;
        throw new XAIError(
          errorBody?.error?.message || 'Unknown error',
          errorBody?.error?.code || 'unknown',
          response.status
        );
      }
      
      return response.json as ImageGenerationResponse;
    });
  }

  private async makeRequest(
    endpoint: string, 
    method: 'GET' | 'POST', 
    body?: unknown
  ): Promise<{ status: number; json: unknown }> {
    const params: RequestUrlParam = {
      url: `${XAI_API_BASE}${endpoint}`,
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      params.body = JSON.stringify(body);
    }

    const response = await requestUrl(params);
    
    return {
      status: response.status,
      json: response.json,
    };
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      await this.sleep(this.minRequestInterval - timeSinceLastRequest);
    }
    
    this.lastRequestTime = Date.now();
  }

  private async retryWithBackoff<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (error instanceof XAIError) {
          // Don't retry on authentication or content policy errors
          if (error.httpStatus === 401 || error.httpStatus === 400) {
            throw error;
          }
          
          // Rate limit - wait longer
          if (error.httpStatus === 429) {
            await this.sleep(INITIAL_RETRY_DELAY * Math.pow(2, attempt + 2));
            continue;
          }
        }
        
        // Exponential backoff for other errors
        if (attempt < MAX_RETRIES - 1) {
          await this.sleep(INITIAL_RETRY_DELAY * Math.pow(2, attempt));
        }
      }
    }
    
    throw lastError || new Error('Max retries exceeded');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export class XAIError extends Error {
  constructor(
    message: string,
    public code: string,
    public httpStatus: number
  ) {
    super(message);
    this.name = 'XAIError';
  }
}
