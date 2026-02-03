// Plugin Configuration Constants

export const PLUGIN_ID = 'grokidian';
export const PLUGIN_NAME = 'Grokidian';
export const PLUGIN_VERSION = '1.0.0';

// API Configuration
export const XAI_API_BASE = 'https://api.x.ai/v1';
export const IMAGE_MODEL = 'grok-2-image';
export const VIDEO_MODEL = 'grok-2-video'; // Phase 2

// Default Settings
export const DEFAULT_IMAGE_COUNT = 3;
export const MIN_IMAGE_COUNT = 1;
export const MAX_IMAGE_COUNT = 10;

export const DEFAULT_ASPECT_RATIO = '16:9';

// Content Analysis
export const MAX_CONCEPTS_TO_EXTRACT = 8;
export const MIN_CONFIDENCE_SCORE = 70;

// Smart Placement
export const TOP_PLACEMENT_SUGGESTIONS = 3;
export const MIN_PLACEMENT_SCORE = 70;

// File naming
export const IMAGE_FILE_PREFIX = 'grokidian';
export const DATE_FORMAT = 'YYYY-MM-DD';
export const TIMESTAMP_FORMAT = 'HHmmss';

// Supported Languages
export type SupportedLanguage = 'en' | 'ko';
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

// Keyboard Shortcuts (default)
export const HOTKEYS = {
  GENERATE_AUTO: 'Mod+Shift+G',
  GENERATE_FROM_SELECTION: 'Mod+Shift+S',
  GENERATE_VIDEO: 'Mod+Shift+V', // Phase 2
};

// Rate Limiting
export const RATE_LIMIT_DELAY_MS = 100;
export const MAX_RETRIES = 3;
export const INITIAL_RETRY_DELAY_MS = 1000;

// UI
export const MODAL_WIDTH = 600;
export const PROGRESS_UPDATE_INTERVAL_MS = 500;
