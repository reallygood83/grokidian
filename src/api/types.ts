// xAI API Types

export type AspectRatio = '16:9' | '4:3' | '1:1' | '9:16' | '3:4' | '3:2' | '2:3';
export type ResponseFormat = 'url' | 'b64_json';

// Image Generation
export interface ImageGenerationRequest {
  prompt: string;
  model: string;
  n: number;
  aspect_ratio?: AspectRatio;
  response_format?: ResponseFormat;
}

export interface ImageData {
  url?: string;
  b64_json?: string;
  revised_prompt?: string;
}

export interface ImageGenerationResponse {
  data: ImageData[];
  created: number;
}

// Video Generation (Phase 2)
export interface VideoGenerationRequest {
  prompt: string;
  model: string;
  duration?: number;
  resolution?: '720p' | '480p';
  aspect_ratio?: AspectRatio;
  image_url?: string;
}

export interface VideoGenerationResponse {
  id: string;
  status: VideoStatus;
  video_url?: string;
  created: number;
}

export type VideoStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Chat Completion Types
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface ChatCompletionResponse {
  id: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Error Types
export interface XAIErrorResponse {
  error: {
    message: string;
    type: string;
    code: string;
  };
}

// Plugin Types
export type StyleTier = 'S' | 'A' | 'B' | 'C';

export interface StyleTemplate {
  id: string;
  name: string;
  tier: StyleTier;
  modifier: string;
  qualityEnhancers: string;
  bestFor: string[];
  icon: string;
}

export type UseCaseTemplateId = 
  | 'educational_diagram'
  | 'concept_visualization'
  | 'process_flow'
  | 'character_illustration'
  | 'scene_setting'
  | 'data_visualization'
  | 'historical_recreation'
  | 'scientific_illustration'
  | 'architectural_visualization'
  | 'product_mockup';

export interface UseCaseTemplate {
  id: UseCaseTemplateId;
  name: string;
  icon: string;
  description: string;
  bestStyles: string[];
  promptPattern: string;
  keywords: string[];
}

export type ContentType = 
  | 'educational'
  | 'scientific'
  | 'creative_fiction'
  | 'technical'
  | 'historical'
  | 'business'
  | 'philosophical'
  | 'personal_notes';

export interface NoteStructure {
  headings: Heading[];
  sections: Section[];
  paragraphs: Paragraph[];
  codeBlocks: CodeBlock[];
  lists: ListItem[];
}

export interface Heading {
  level: number;
  text: string;
  line: number;
}

export interface Section {
  heading: Heading | null;
  content: string;
  startLine: number;
  endLine: number;
  topics: string[];
}

export interface Paragraph {
  text: string;
  line: number;
  topics: string[];
}

export interface CodeBlock {
  language: string;
  content: string;
  startLine: number;
  endLine: number;
}

export interface ListItem {
  text: string;
  line: number;
  indent: number;
}

export interface UseCaseMatch {
  template: UseCaseTemplate;
  confidence: number;
  reasoning: string;
}

export interface PlacementSuggestion {
  location: InsertionLocation;
  score: number;
  reasoning: string;
  contextPreview: string;
}

export interface InsertionLocation {
  lineNumber: number;
  position: 'before' | 'after';
  anchor: string;
}

export type InsertionMode = 'ai_smart' | 'manual' | 'ask_each_time';

export type StorageLocation = 'obsidian' | 'vault_custom' | 'external';

export interface GrokidianSettings {
  apiKey: string;
  defaultStyle: string;
  defaultAspectRatio: AspectRatio;
  defaultImageCount: number;
  insertionMode: InsertionMode;
  storageLocation: StorageLocation;
  useObsidianAttachmentFolder: boolean;
  customStoragePath: string;
  externalFolderPath: string;
  createMonthlySubfolders: boolean;
  includeTimestampInFilename: boolean;
  defaultUseCase: 'auto_detect' | UseCaseTemplateId;
}

export const DEFAULT_SETTINGS: GrokidianSettings = {
  apiKey: '',
  defaultStyle: 'hyper_realism',
  defaultAspectRatio: '16:9',
  defaultImageCount: 3,
  insertionMode: 'ai_smart',
  storageLocation: 'obsidian',
  useObsidianAttachmentFolder: true,
  customStoragePath: '',
  externalFolderPath: '',
  createMonthlySubfolders: true,
  includeTimestampInFilename: true,
  defaultUseCase: 'auto_detect',
};
