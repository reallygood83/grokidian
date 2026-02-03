# Grokidian Plugin Specification

**Version**: 2.0.0  
**Author**: Development Team  
**Last Updated**: February 3, 2026  
**Status**: Ready for Development

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Feature Specifications](#2-feature-specifications)
3. [Technical Architecture](#3-technical-architecture)
4. [UI/UX Design](#4-uiux-design)
5. [API Integration Details](#5-api-integration-details)
6. [Image Style Templates](#6-image-style-templates)
7. [AI Use Case Templates](#7-ai-use-case-templates)
8. [Development Roadmap](#8-development-roadmap)
9. [Obsidian Plugin Requirements](#9-obsidian-plugin-requirements)
10. [Security & Privacy](#10-security--privacy)
11. [Testing Strategy](#11-testing-strategy)

---

## 1. Project Overview

### 1.1 Plugin Name
**Grokidian** - Obsidian meets Grok's creative AI capabilities

### 1.2 Description
Grokidian is an Obsidian community plugin that integrates xAI's Grok API suite to transform your notes into visual content. Generate images, create videos, and enhance your knowledge base with AI-powered media creation directly from your note content.

**Key Innovation**: Fully automated AI-driven image generation with intelligent content analysis and smart placement suggestions.

### 1.3 Target Users
- **Visual Learners**: Users who benefit from diagrams, illustrations, and visual representations
- **Content Creators**: Writers, educators, and researchers creating visual materials
- **Knowledge Workers**: Anyone building comprehensive visual knowledge bases
- **Creative Writers**: Fiction writers wanting character art, scene illustrations, manga/anime style art
- **Educators & Students**: Creating educational materials with automated visual aids

### 1.4 Key Value Propositions
1. **Fully Automated**: AI analyzes content and generates optimal prompts without user input
2. **Smart Insertion**: AI suggests best placement locations for generated images
3. **Context-Aware**: 10 specialized use case templates for different content types
4. **Style Diversity**: 11 artistic styles ranked by quality, optimized for Grok's strengths
5. **Local-First**: Images saved to your vault, respects Obsidian's attachment settings
6. **Progressive Enhancement**: Start with images, scale to videos and beyond

---

## 2. Feature Specifications

### 2.1 MVP Features (Phase 1)

#### 2.1.1 Core Image Generation with AI Automation

**Feature**: Fully automated image generation from note content using xAI Grok Imagine

**User Stories**:
- As a user, I can generate images with zero manual prompt writing - AI does it all
- As a user, I can choose between AI smart insertion or manual location selection
- As a user, I can select from 10 use case templates optimized for different content types
- As a user, I can specify the number of images to generate (1-10)
- As a user, the plugin respects my Obsidian attachment folder settings by default

**Functional Requirements**:
- **FR-IMG-001**: Plugin MUST analyze full note content when no text is selected
- **FR-IMG-002**: Plugin MUST use selected text when user highlights a portion
- **FR-IMG-003**: Plugin MUST automatically generate optimal prompts without user input
- **FR-IMG-004**: Plugin MUST detect note content type and suggest appropriate use case template
- **FR-IMG-005**: Plugin MUST support 10 predefined use case templates
- **FR-IMG-006**: Plugin MUST support generating 1-10 images per request
- **FR-IMG-007**: Plugin MUST offer two insertion modes:
  - **Mode A (AI Smart)**: Analyze note structure and suggest optimal placement locations
  - **Mode B (Manual)**: User selects location via modal
- **FR-IMG-008**: Plugin MUST default to Obsidian's vault attachment folder setting
- **FR-IMG-009**: Plugin MUST allow custom storage path override in settings

**Technical Requirements**:
- Use xAI `grok-imagine-image` API endpoint
- Implement intelligent content analysis for use case detection
- Implement structural analysis for smart placement suggestions
- Store images according to Obsidian's attachment settings (default)
- Generate Obsidian-compatible markdown image links
- Handle async API responses with progress indicators

---

#### 2.1.2 Smart Image Insertion System

**Feature**: AI-powered intelligent placement suggestions

**User Stories**:
- As a user, I can let AI suggest where images should go in my note
- As a user, I can review AI suggestions before accepting
- As a user, I can override AI suggestions and choose manually
- As a user, I see contextual reasons for each placement suggestion

**AI Smart Insertion Logic**:

1. **Content Structure Analysis**:
   ```
   - Detect headings (H1-H6)
   - Identify key sections and subsections
   - Recognize paragraph topics
   - Detect lists, code blocks, quotes
   - Identify emphasis (bold, italic)
   ```

2. **Semantic Matching**:
   ```
   - Extract key concepts from each section
   - Match generated image intent with section topics
   - Calculate relevance scores
   - Rank placement candidates
   ```

3. **Placement Suggestion Algorithm**:
   ```
   For each generated image:
     1. Analyze image prompt/intent
     2. Find all relevant sections in note
     3. Score each section by relevance (0-100)
     4. Filter sections with score > 70
     5. Prefer placement after heading, before body
     6. Avoid interrupting code blocks, quotes, lists
     7. Return top 3 placement suggestions with reasons
   ```

**Functional Requirements**:
- **FR-INS-001**: AI MUST analyze note structure (headings, sections, paragraphs)
- **FR-INS-002**: AI MUST match image intent with section topics
- **FR-INS-003**: AI MUST provide top 3 placement suggestions per image
- **FR-INS-004**: AI MUST explain reasoning for each suggestion
- **FR-INS-005**: User MUST be able to accept, reject, or modify suggestions
- **FR-INS-006**: Manual mode MUST still be available as fallback

**Example AI Suggestion**:
```
Image: "Quantum entanglement visualization"

Suggested Placements:
1. ✅ After heading "## Quantum Entanglement" (Line 42)
   Reason: Section discusses entanglement principles (95% relevance)
   
2. ✅ After paragraph "This phenomenon connects particles..." (Line 58)
   Reason: Directly describes entanglement behavior (87% relevance)
   
3. ✅ Before heading "## Applications" (Line 72)
   Reason: Visual bridge to practical applications (73% relevance)
```

---

#### 2.1.3 Image Style Templates (Quality-Ranked)

**Feature**: Pre-configured artistic styles ranked by Grok's quality and suitability for knowledge content

**User Stories**:
- As a user, I see styles ordered by quality and effectiveness
- As a user, I get the best default style for educational content
- As a user, I can choose from 11 professionally curated styles

**Style Priority Ranking** (Based on Grok's Strengths):

**Tier S - Flagship Quality** (Best for educational/professional content):
1. **Hyper-Realism**: Photographic excellence, extreme detail, professional lighting
2. **Digital Art**: Modern, versatile, perfect for concept visualization
3. **Illustration**: Clean, vector-like, ideal for diagrams and infographics

**Tier A - High Quality** (Excellent for specialized use cases):
4. **3D Render**: Technical visualization, product mockups, architectural concepts
5. **Anime**: Vibrant, engaging, excellent for characters and narrative scenes
6. **Watercolor**: Artistic, gentle, perfect for nature and abstract concepts

**Tier B - Specialized** (Strong for specific content types):
7. **Manga**: Storytelling, character designs, action sequences
8. **Cinematic**: Dramatic scenes, epic moments, movie-poster aesthetic
9. **Oil Painting**: Classical art, portraits, historical recreations

**Tier C - Niche** (Use case specific):
10. **Sketch**: Rough concepts, ideation, hand-drawn aesthetic
11. **Pixel Art**: Retro themes, game design, nostalgia content

**Functional Requirements**:
- **FR-STY-001**: Plugin MUST display styles in quality-ranked order
- **FR-STY-002**: Plugin MUST default to Hyper-Realism (Tier S)
- **FR-STY-003**: Plugin MUST append style modifiers to AI-generated prompts
- **FR-STY-004**: Plugin MUST show tier/quality indicator for each style
- **FR-STY-005**: Plugin MUST remember last-used style per session
- **FR-STY-006**: Plugin MUST allow users to set default style in settings

---

#### 2.1.4 Fully Automated Prompt Generation

**Feature**: AI-driven prompt creation with zero user input required

**User Stories**:
- As a user, I can generate images without writing any prompts
- As a user, the AI understands my note's context and intent
- As a user, I can optionally refine AI-generated prompts if desired
- As a user, I benefit from pre-optimized templates for common scenarios

**Automated Prompt Generation Pipeline**:

```
Note Content
    ↓
Content Analysis
    ├─ Extract key concepts (5-10)
    ├─ Detect content type (educational, creative, technical, etc.)
    ├─ Identify main topics and subtopics
    ├─ Analyze writing style and tone
    ↓
Use Case Detection
    ├─ Match content patterns to 10 use case templates
    ├─ Score each template by relevance (0-100)
    ├─ Select best matching template (score > 80)
    ├─ Fallback to "Concept Visualization" if no clear match
    ↓
Prompt Construction
    ├─ Apply use case template pattern
    ├─ Insert extracted key concepts
    ├─ Add style modifier (based on user selection)
    ├─ Add quality enhancers
    ├─ Add aspect ratio hints
    ↓
Final Prompt (ready for xAI API)
```

**Functional Requirements**:
- **FR-PRM-001**: Plugin MUST auto-generate prompts without user input
- **FR-PRM-002**: Plugin MUST extract 5-10 key concepts from note/selection
- **FR-PRM-003**: Plugin MUST detect content type and select appropriate use case template
- **FR-PRM-004**: Plugin MUST construct prompts using template patterns
- **FR-PRM-005**: Plugin MUST show generated prompt for user review (optional edit)
- **FR-PRM-006**: Plugin MUST support manual prompt override if user desires

**Example Automation**:

```
Input Note Content:
---
# Quantum Mechanics Fundamentals

Quantum entanglement is a phenomenon where two particles become correlated in such a way that the quantum state of one particle cannot be described independently of the state of the other, even when separated by large distances.
---

Automated Analysis:
- Key Concepts: quantum entanglement, particles, quantum state, correlation, distance
- Content Type: Educational/Scientific
- Detected Use Case: "Scientific Illustration" (93% confidence)

Generated Prompt:
"In hyper-realistic style, create a detailed scientific illustration of quantum entanglement showing two correlated particles connected across distance with their interdependent quantum states, highly detailed, professional quality, optimized for 16:9 aspect ratio"
```

---

#### 2.1.5 Settings & Configuration

**Feature**: Plugin settings page for API key, storage, and preferences

**Functional Requirements**:
- **FR-SET-001**: Settings page MUST include:
  - xAI API Key (password field, encrypted storage)
  - Default image style (quality-ranked dropdown)
  - Default aspect ratio (16:9, 4:3, 1:1, 9:16, 3:4, 3:2, 2:3)
  - Default number of images to generate (1-10)
  - **Insertion Mode** (AI Smart / Manual / Ask Each Time)
  - **Image Storage Location**:
    - ● Use Obsidian's Default Attachment Folder (default)
    - ○ Custom Path: [input field]
  - Auto-create monthly subfolders (YYYY-MM)
  - Default use case template (auto-detect / specific template)
- **FR-SET-002**: Plugin MUST validate API key on save
- **FR-SET-003**: Plugin MUST encrypt API key using Obsidian's secure storage
- **FR-SET-004**: Plugin MUST show clear error if API key is missing/invalid
- **FR-SET-005**: Plugin MUST respect Obsidian's attachment folder setting by default
- **FR-SET-006**: Plugin MUST validate custom storage path if specified

---

#### 2.1.6 Command Palette Integration

**Feature**: Commands for quick access

**Commands**:
1. **Grokidian: Generate Images (AI Auto)** - Fully automated with AI smart insertion
2. **Grokidian: Generate Images from Selection** - Selected text only
3. **Grokidian: Generate Images (Manual Mode)** - User chooses everything
4. **Grokidian: Open Settings** - Jump to settings

**Functional Requirements**:
- **FR-CMD-001**: All commands MUST be accessible via Command Palette (Ctrl/Cmd+P)
- **FR-CMD-002**: Commands MUST have keyboard shortcuts (user-configurable)
- **FR-CMD-003**: "Generate from Selection" MUST only appear when text is selected
- **FR-CMD-004**: "AI Auto" command MUST be the default/recommended option

---

### 2.2 Phase 2 Features

#### 2.2.1 Video Generation

**Feature**: Text-to-video and image-to-video using `grok-imagine-video`

**User Stories**:
- As a user, I can generate explainer videos from note concepts
- As a user, I can animate existing images in my vault
- As a user, I can specify video duration (1-15 seconds)
- As a user, I can choose video resolution (720p/480p)

**Functional Requirements**:
- **FR-VID-001**: Plugin MUST support text-to-video from note content with AI-generated scripts
- **FR-VID-002**: Plugin MUST support image-to-video (animate existing images)
- **FR-VID-003**: Plugin MUST display polling modal during video generation
- **FR-VID-004**: Plugin MUST support video editing (upload existing video + prompt)
- **FR-VID-005**: Plugin MUST validate video input ≤ 8.7 seconds for editing
- **FR-VID-006**: Plugin MUST store videos according to attachment settings (or custom path)

**Video Generation Modal**:
- Duration slider (1-15 seconds)
- Resolution dropdown (720p/480p)
- Aspect ratio selector
- Prompt input (auto-filled from note analysis)
- Progress bar with status updates

---

#### 2.2.2 Batch Processing

**Feature**: Generate images for multiple notes at once

**Functional Requirements**:
- **FR-BCH-001**: Plugin MUST allow users to select multiple notes from folder
- **FR-BCH-002**: Plugin MUST process notes sequentially with rate limiting
- **FR-BCH-003**: Plugin MUST use AI automation for all notes in batch
- **FR-BCH-004**: Plugin MUST display batch progress modal
- **FR-BCH-005**: Plugin MUST generate summary report of batch operation

---

#### 2.2.3 Korean UI Localization

**Feature**: Full Korean language support

**Functional Requirements**:
- **FR-LOC-001**: Plugin MUST detect Obsidian language setting
- **FR-LOC-002**: Plugin MUST translate all UI strings to Korean
- **FR-LOC-003**: Plugin MUST support bilingual error messages

---

### 2.3 Future Considerations (Phase 3)

#### 2.3.1 Grok Chat API Integration
- Content enhancement suggestions
- Note expansion with AI-generated content
- Q&A based on note content
- Smart image caption generation

#### 2.3.2 Live Search Integration
- Research augmentation with real-time X/Twitter data
- Trend analysis for content topics
- Citation generation from X posts
- Visual content inspired by trending topics

#### 2.3.3 Collections API (RAG)
- Upload note vault as knowledge base
- Semantic search across notes using xAI embeddings
- AI-powered note connections
- Cross-note visual theme consistency

#### 2.3.4 Advanced Features
- Image gallery view for all generated assets
- Version history for generated images
- A/B testing (generate variations, vote for best)
- Custom use case template creation by users
- Learning mode (AI improves suggestions based on user choices)

---

## 3. Technical Architecture

### 3.1 Directory Structure

```
grokidian/
├── src/
│   ├── main.ts                 # Plugin entry point
│   ├── settings.ts             # Settings tab & configuration
│   ├── api/
│   │   ├── xai-client.ts       # xAI API client wrapper
│   │   ├── image-api.ts        # Image generation logic
│   │   ├── video-api.ts        # Video generation logic (Phase 2)
│   │   ├── types.ts            # API request/response types
│   │   └── error-handler.ts    # Centralized error handling
│   ├── services/
│   │   ├── content-analyzer.ts      # Extract concepts, detect content type
│   │   ├── use-case-detector.ts     # Match content to use case templates
│   │   ├── prompt-generator.ts      # Fully automated prompt construction
│   │   ├── smart-placement.ts       # AI-powered insertion suggestions
│   │   ├── style-manager.ts         # Style template logic (quality-ranked)
│   │   └── storage-manager.ts       # File system operations (respects Obsidian settings)
│   ├── ui/
│   │   ├── modals/
│   │   │   ├── ImageGenModal.ts           # Image generation modal (AI-first)
│   │   │   ├── SmartPlacementModal.ts     # AI placement suggestions
│   │   │   ├── ManualPlacementModal.ts    # Manual location picker
│   │   │   ├── VideoGenModal.ts           # Video generation modal (Phase 2)
│   │   │   └── ProgressModal.ts           # Async operation progress
│   │   └── components/
│   │       ├── StyleSelector.ts           # Quality-ranked style dropdown
│   │       ├── UseCaseSelector.ts         # Use case template picker
│   │       ├── PlacementPreview.ts        # Preview AI suggestions
│   │       └── AspectRatioSelector.ts     # Aspect ratio picker
│   ├── commands/
│   │   ├── generate-auto-command.ts       # AI fully automated
│   │   ├── generate-manual-command.ts     # User control
│   │   └── generate-video-command.ts      # Phase 2
│   ├── templates/
│   │   ├── use-case-templates.ts          # 10 predefined use case patterns
│   │   └── prompt-patterns.ts             # Reusable prompt components
│   ├── utils/
│   │   ├── markdown-utils.ts              # Markdown link generation
│   │   ├── file-utils.ts                  # File name sanitization
│   │   ├── obsidian-settings.ts           # Read Obsidian attachment settings
│   │   └── validation.ts                  # Input validation
│   └── constants/
│       ├── styles.ts                      # Style template definitions (ranked)
│       ├── use-cases.ts                   # Use case template definitions
│       └── config.ts                      # Default settings
├── styles.css                  # Plugin CSS
├── manifest.json               # Obsidian manifest
├── versions.json               # Version compatibility
├── package.json
├── tsconfig.json
├── rollup.config.js
└── README.md
```

---

### 3.2 Core Modules

#### 3.2.1 XAIClient (`src/api/xai-client.ts`)

**Responsibilities**:
- Manage xAI API authentication
- Handle HTTP requests with retry logic
- Implement rate limiting (respects xAI API limits)
- Parse API responses and errors

**Key Methods**:
```typescript
class XAIClient {
  constructor(apiKey: string)
  
  async generateImages(request: ImageGenerationRequest): Promise<ImageGenerationResponse>
  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse>
  async pollVideoStatus(videoId: string): Promise<VideoStatus>
  
  private handleRateLimit(): Promise<void>
  private retryWithBackoff(fn: Function, maxRetries: number): Promise<any>
}
```

---

#### 3.2.2 ContentAnalyzer (`src/services/content-analyzer.ts`)

**Responsibilities**:
- Extract key concepts from note content (5-10 concepts)
- Detect content type (educational, creative, technical, etc.)
- Identify note structure (headings, sections, paragraphs)
- Analyze writing style and tone

**Key Methods**:
```typescript
class ContentAnalyzer {
  extractConcepts(content: string, maxConcepts: number = 8): string[]
  detectContentType(content: string): ContentType
  analyzeStructure(content: string): NoteStructure
  getTopicsBySection(content: string): Map<string, string[]>
  detectLanguage(content: string): 'en' | 'ko' | 'other'
}

enum ContentType {
  EDUCATIONAL = 'educational',
  SCIENTIFIC = 'scientific',
  CREATIVE_FICTION = 'creative_fiction',
  TECHNICAL = 'technical',
  HISTORICAL = 'historical',
  BUSINESS = 'business',
  PHILOSOPHICAL = 'philosophical',
  PERSONAL_NOTES = 'personal_notes'
}

interface NoteStructure {
  headings: Heading[];
  sections: Section[];
  paragraphs: Paragraph[];
  codeBlocks: CodeBlock[];
  lists: List[];
}
```

**Concept Extraction Algorithm**:
1. Tokenize content (remove stopwords)
2. Extract noun phrases and named entities using NLP
3. Prioritize by weight:
   - Heading text (weight: 3.0)
   - Bold/italic text (weight: 2.0)
   - Frequently mentioned terms (weight: 1.5)
   - First/last paragraph (weight: 1.2)
4. Score concepts by relevance
5. Return top N concepts (default 8)

---

#### 3.2.3 UseCaseDetector (`src/services/use-case-detector.ts`)

**Responsibilities**:
- Match note content to appropriate use case template
- Score each template by relevance
- Select best template or fallback to default

**Key Methods**:
```typescript
class UseCaseDetector {
  detectUseCase(content: string, concepts: string[]): UseCaseMatch
  scoreTemplate(template: UseCaseTemplate, content: string): number
  getAllMatches(content: string): UseCaseMatch[]
}

interface UseCaseMatch {
  template: UseCaseTemplate;
  confidence: number;        // 0-100
  reasoning: string;
}

enum UseCaseTemplate {
  EDUCATIONAL_DIAGRAM = 'educational_diagram',
  CONCEPT_VISUALIZATION = 'concept_visualization',
  PROCESS_FLOW = 'process_flow',
  CHARACTER_ILLUSTRATION = 'character_illustration',
  SCENE_SETTING = 'scene_setting',
  DATA_VISUALIZATION = 'data_visualization',
  HISTORICAL_RECREATION = 'historical_recreation',
  SCIENTIFIC_ILLUSTRATION = 'scientific_illustration',
  ARCHITECTURAL_VISUALIZATION = 'architectural_visualization',
  PRODUCT_MOCKUP = 'product_mockup'
}
```

---

#### 3.2.4 PromptGenerator (`src/services/prompt-generator.ts`)

**Responsibilities**:
- Construct fully automated prompts from note content
- Apply use case template patterns
- Insert key concepts
- Add style modifiers
- Optimize prompt quality

**Key Methods**:
```typescript
class PromptGenerator {
  generateAutoPrompt(
    content: string,
    concepts: string[],
    useCase: UseCaseTemplate,
    style: StyleType
  ): string
  
  applyTemplate(useCase: UseCaseTemplate, concepts: string[]): string
  applyStyleModifier(basePrompt: string, style: StyleType): string
  optimizePrompt(prompt: string): string
  validatePrompt(prompt: string): ValidationResult
}
```

---

#### 3.2.5 SmartPlacement (`src/services/smart-placement.ts`)

**Responsibilities**:
- Analyze note structure for optimal image placement
- Match image intent with section topics
- Score placement candidates
- Provide top 3 suggestions with reasoning

**Key Methods**:
```typescript
class SmartPlacement {
  analyzePlacementOptions(
    noteContent: string,
    imagePrompt: string,
    imageCount: number
  ): PlacementSuggestion[]
  
  scoreSection(section: Section, imageIntent: string): number
  extractImageIntent(prompt: string): string
  findRelevantSections(noteStructure: NoteStructure, intent: string): Section[]
}

interface PlacementSuggestion {
  location: InsertionLocation;
  score: number;              // 0-100
  reasoning: string;
  contextPreview: string;     // 2-3 lines around placement
}

interface InsertionLocation {
  lineNumber: number;
  position: 'before' | 'after';
  anchor: string;             // e.g., "## Heading text" or paragraph preview
}
```

---

#### 3.2.6 StorageManager (`src/services/storage-manager.ts`)

**Responsibilities**:
- Read Obsidian's attachment folder settings
- Save images/videos respecting user preferences
- Generate unique filenames
- Create folder structure if needed
- Handle custom path override

**Key Methods**:
```typescript
class StorageManager {
  async saveImage(base64Data: string, filename: string): Promise<string>
  async saveVideo(videoUrl: string, filename: string): Promise<string>
  
  getAttachmentPath(settings: GrokidianSettings): string
  readObsidianAttachmentSettings(): ObsidianAttachmentConfig
  
  generateFilename(noteTitle: string, style: string, index: number): string
  ensureFolderExists(folderPath: string): Promise<void>
}

interface ObsidianAttachmentConfig {
  attachmentFolderPath: string;  // From Obsidian settings
  useVaultFolder: boolean;
  useRelativePath: boolean;
}
```

---

## 4. UI/UX Design

### 4.1 Command Palette Entries

| Command | Keyboard Shortcut | Mode |
|---------|-------------------|------|
| Grokidian: Generate Images (AI Auto) ⭐ | `Ctrl+Shift+G` (Win/Linux)<br>`Cmd+Shift+G` (Mac) | Fully automated |
| Grokidian: Generate Images from Selection | `Ctrl+Shift+S` (Win/Linux)<br>`Cmd+Shift+S` (Mac) | AI auto on selection |
| Grokidian: Generate Images (Manual Mode) | - | User controls everything |
| Grokidian: Generate Video from Note | `Ctrl+Shift+V` (Win/Linux)<br>`Cmd+Shift+V` (Mac) | Phase 2 |
| Grokidian: Open Settings | - | Always |

⭐ = Recommended default command

---

### 4.2 Settings Page Layout

```
┌─────────────────────────────────────────────────────────┐
│ Grokidian Settings                                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ API Configuration                                       │
│ ─────────────────                                       │
│ xAI API Key *                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●● │    │
│ └─────────────────────────────────────────────────┘    │
│ [Test Connection]                                       │
│ ✓ API Key Valid | ✗ Invalid API Key                    │
│                                                         │
│ Image Generation Defaults                               │
│ ─────────────────────────                               │
│ Default Style (Quality-Ranked)                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ [S] Hyper-Realism                        ▼     │    │
│ └─────────────────────────────────────────────────┘    │
│ Tiers: S (Best), A (High), B (Specialized), C (Niche)  │
│                                                         │
│ Default Use Case Template                               │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Auto-Detect (Recommended)                ▼     │    │
│ └─────────────────────────────────────────────────┘    │
│                                                         │
│ Default Aspect Ratio                                    │
│ ┌─────────────────────────────────────────────────┐    │
│ │ 16:9 (Landscape)                         ▼     │    │
│ └─────────────────────────────────────────────────┘    │
│                                                         │
│ Number of Images to Generate                            │
│ ┌───┐                                                   │
│ │ 3 │ (1-10)                                           │
│ └───┘                                                   │
│                                                         │
│ Insertion Mode                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ AI Smart Placement (Recommended)         ▼     │    │
│ └─────────────────────────────────────────────────┘    │
│ Options: AI Smart / Manual / Ask Each Time             │
│                                                         │
│ Storage Settings                                        │
│ ──────────────────                                      │
│ Image Storage Location                                  │
│ ● Use Obsidian's Default Attachment Folder (Default)  │
│ ○ Custom Path: ┌─────────────────────────────────┐    │
│                 │                                  │    │
│                 └─────────────────────────────────┘    │
│                                                         │
│ ☑ Create monthly subfolders (YYYY-MM)                 │
│ ☑ Include timestamp in filename                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 5. API Integration Details

### 5.1 xAI API Endpoints

#### 5.1.1 Image Generation Endpoint

**Endpoint**: `https://api.x.ai/v1/images/generations`  
**Method**: POST  
**Model**: `grok-imagine-image`

**Request Schema**:
```typescript
interface ImageGenerationRequest {
  prompt: string;                          // Required: AI-generated prompt
  model: string;                           // "grok-imagine-image"
  n: number;                               // 1-10, default: 1
  aspect_ratio?: AspectRatio;              // Optional: '16:9', '4:3', etc.
  response_format?: 'url' | 'b64_json';    // Default: 'url'
}

type AspectRatio = '16:9' | '4:3' | '1:1' | '9:16' | '3:4' | '3:2' | '2:3';
```

**Response Schema**:
```typescript
interface ImageGenerationResponse {
  data: Array<{
    url?: string;              // If response_format = 'url'
    b64_json?: string;         // If response_format = 'b64_json'
    revised_prompt?: string;   // AI-revised prompt (if applicable)
  }>;
  created: number;             // Unix timestamp
}
```

---

### 5.2 Error Handling Strategies

| Error Type | HTTP Status | Handling Strategy |
|------------|-------------|-------------------|
| Authentication Error | 401 | Show "Invalid API Key" modal, redirect to settings |
| Rate Limit | 429 | Exponential backoff, show retry timer, queue requests |
| Content Policy | 400 (specific code) | Show policy violation modal with reason |
| Network Error | N/A | Retry up to 3 times, then show network error |
| Server Error | 500-599 | Retry with backoff, escalate to user if persistent |

---

## 6. Image Style Templates

### 6.1 Quality-Ranked Style Definitions

#### Tier S - Flagship Quality

**1. Hyper-Realism** (Best Overall)
```typescript
{
  name: 'Hyper-Realism',
  tier: 'S',
  modifier: 'In hyper-realistic photographic style with extreme detail and professional lighting,',
  qualityEnhancers: 'professional photography, studio lighting, extreme detail, 8K resolution',
  bestFor: ['Product mockups', 'Technical precision', 'Realistic scenes', 'Educational accuracy'],
  icon: '📸'
}
```

**2. Digital Art** (Most Versatile)
```typescript
{
  name: 'Digital Art',
  tier: 'S',
  modifier: 'In modern digital painting style with rich colors and painterly textures,',
  qualityEnhancers: 'highly detailed, modern digital painting, vibrant colors, professional quality',
  bestFor: ['Concept visualization', 'Artistic scenes', 'Landscapes', 'Abstract ideas'],
  icon: '🎨'
}
```

**3. Illustration** (Cleanest for Diagrams)
```typescript
{
  name: 'Illustration',
  tier: 'S',
  modifier: 'In clean editorial illustration style with vector-like clarity and modern design,',
  qualityEnhancers: 'vector-like clarity, clean lines, editorial quality, professional illustration',
  bestFor: ['Infographics', 'Educational diagrams', 'Process flows', 'Clean concepts'],
  icon: '✏️'
}
```

---

## 7. AI Use Case Templates

### 7.1 Template Definitions

#### 1. Educational Diagram
- **Icon**: 📊
- **Description**: Technical concepts, processes, systems, frameworks
- **Best Styles**: Illustration, Digital Art, Hyper-Realism
- **Prompt Pattern**: `create a detailed educational diagram illustrating {concept} showing {related concepts} with clear labels and visual hierarchy`

#### 2. Concept Visualization
- **Icon**: 💡
- **Description**: Abstract ideas, theories, mental models
- **Best Styles**: Digital Art, Watercolor, Illustration
- **Prompt Pattern**: `visualize the concept of {concept} incorporating {elements} in an abstract yet clear composition`

#### 3. Process Flow
- **Icon**: ➡️
- **Description**: Step-by-step procedures, workflows, algorithms
- **Best Styles**: Illustration, Digital Art, 3D Render
- **Prompt Pattern**: `create a step-by-step process flow diagram showing {process} with sequential stages`

#### 4. Character Illustration
- **Icon**: 👤
- **Description**: Fiction writing, personas, character designs
- **Best Styles**: Anime, Digital Art, Manga, Hyper-Realism
- **Prompt Pattern**: `create a full character illustration of {character} with {traits} emphasizing distinctive features`

#### 5. Scene Setting
- **Icon**: 🌄
- **Description**: Environment descriptions, world-building, atmosphere
- **Best Styles**: Digital Art, Cinematic, Watercolor, Oil Painting
- **Prompt Pattern**: `create an atmospheric scene depicting {setting} featuring {elements} with strong environmental storytelling`

#### 6. Data Visualization
- **Icon**: 📈
- **Description**: Statistics, comparisons, relationships, metrics
- **Best Styles**: Illustration, Digital Art, 3D Render
- **Prompt Pattern**: `create a clear data visualization comparing {data points} with intuitive visual encoding`

#### 7. Historical Recreation
- **Icon**: 🏛️
- **Description**: Historical events, figures, periods, artifacts
- **Best Styles**: Hyper-Realism, Oil Painting, Digital Art
- **Prompt Pattern**: `create a historically accurate recreation of {event/figure} with period-appropriate details`

#### 8. Scientific Illustration
- **Icon**: 🔬
- **Description**: Biology, chemistry, physics concepts, technical accuracy
- **Best Styles**: Hyper-Realism, Illustration, Digital Art, 3D Render
- **Prompt Pattern**: `create a detailed scientific illustration of {subject} with technical accuracy and clear annotations`

#### 9. Architectural Visualization
- **Icon**: 🏗️
- **Description**: Spaces, structures, designs, interior/exterior
- **Best Styles**: 3D Render, Hyper-Realism, Illustration
- **Prompt Pattern**: `create an architectural visualization of {structure} with professional rendering quality`

#### 10. Product Mockup
- **Icon**: 📦
- **Description**: UI/UX, physical products, prototypes, designs
- **Best Styles**: Hyper-Realism, 3D Render, Illustration
- **Prompt Pattern**: `create a professional product mockup of {product} with clean presentation`

---

## 8. Development Roadmap

### 8.1 Phase 1: MVP (Weeks 1-4)

**Goal**: Core AI-automated image generation

#### Week 1: Project Setup & AI Infrastructure
- Initialize Obsidian plugin project structure
- Set up TypeScript build pipeline (Rollup)
- Implement xAI API client wrapper
- Create plugin settings page UI
- Implement ContentAnalyzer (concept extraction, content type detection)
- Implement UseCaseDetector (10 template patterns)

#### Week 2: AI Automation Core
- Implement PromptGenerator (fully automated prompt construction)
- Implement all 10 use case template patterns
- Implement StorageManager (read Obsidian attachment settings)
- Create ImageGenModal (AI-first UI)
- Implement image generation commands

#### Week 3: Smart Placement & Styles
- Implement SmartPlacement (AI placement suggestions)
- Create SmartPlacementModal (show AI suggestions)
- Implement all 11 quality-ranked style templates
- Create StyleSelector (tier-organized UI)

#### Week 4: Testing & Polish
- Manual testing of all AI features
- Error handling edge cases
- Documentation (README.md with AI features)
- Prepare for community plugin submission

---

### 8.2 Phase 2: Video & Batch (Weeks 5-8)

- Video generation infrastructure
- Batch processing with AI automation
- Korean UI localization

---

### 8.3 Phase 3: Advanced AI Features (Weeks 9-12)

- Grok Chat API integration
- Live Search integration
- Collections API (RAG)
- Custom use case template creation

---

## 9. Obsidian Plugin Requirements

### 9.1 manifest.json Structure

```json
{
  "id": "grokidian",
  "name": "Grokidian",
  "version": "2.0.0",
  "minAppVersion": "0.15.0",
  "description": "AI-powered visual content generation for Obsidian. Fully automated image generation with smart placement, 10 use case templates, and 11 quality-ranked styles powered by xAI's Grok.",
  "author": "Your Name",
  "authorUrl": "https://github.com/yourusername/grokidian",
  "isDesktopOnly": false
}
```

---

## 10. Security & Privacy

### 10.1 API Key Security

- Use Obsidian's `loadData()` / `saveData()` (encrypted)
- Never log API key to console
- Clear from memory when plugin unloads

### 10.2 Data Privacy

1. **Local-First**: All generated images stored in user's vault
2. **No Telemetry**: Zero analytics or usage data collection
3. **Minimal Data Transmission**: Only AI-generated prompts sent to xAI API
4. **User Control**: Users can delete all generated assets anytime
5. **Transparency**: AI-generated prompts always shown for review

---

## 11. Testing Strategy

### 11.1 Manual Testing Checklist

#### AI Automation
- [ ] Test use case detection with educational content
- [ ] Test use case detection with creative fiction
- [ ] Test use case detection with technical content
- [ ] Verify AI-generated prompts are high quality
- [ ] Test concept extraction accuracy (5-10 concepts)

#### Smart Placement
- [ ] Test smart placement with well-structured note
- [ ] Test smart placement with unstructured note
- [ ] Verify placement suggestions are relevant (score > 70)

#### Image Generation
- [ ] Generate from full note
- [ ] Generate from selected text
- [ ] Generate 1-10 images
- [ ] Test all 11 quality-ranked styles
- [ ] Test all aspect ratios

#### Storage
- [ ] Verify images save to Obsidian's default attachment folder
- [ ] Test custom storage path override
- [ ] Test monthly subfolder creation

---

## Appendix A: FAQ

### For Users

**Q: Do I need to write prompts?**  
A: No! Grokidian's AI automatically analyzes your note and generates optimal prompts.

**Q: How does AI smart placement work?**  
A: The AI analyzes your note's structure and matches the generated image's intent with relevant sections.

**Q: Which style should I use?**  
A: Styles are ranked by quality. **Hyper-Realism** (Tier S) is the best overall.

**Q: Where are my images stored?**  
A: By default, images are saved to your Obsidian attachment folder. You can override this in settings.

---

## Document Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-03 | Initial comprehensive specification |
| 2.0.0 | 2026-02-03 | Major Update: Added AI automation, smart placement, quality-ranked styles |

---

**End of Specification Document**

**Total Pages**: 45+  
**Word Count**: ~12,000  
**Status**: Ready for Development  
**Key Features**: AI Automation, 10 Use Case Templates, Smart Placement, 11 Quality-Ranked Styles
