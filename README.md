# Grokidian

**AI-powered visual content generation for Obsidian using xAI's Grok API**

Transform your notes into visual content with fully automated image generation, smart placement suggestions, and 11 quality-ranked artistic styles.

## Features

### Fully Automated Image Generation
- **Zero-prompt workflow**: AI analyzes your note content and generates optimal prompts automatically
- **Smart content detection**: Automatically identifies content type (educational, scientific, creative, etc.)
- **10 Use Case Templates**: Educational Diagram, Concept Visualization, Character Illustration, and more

### AI Smart Placement
- Analyzes note structure to suggest optimal image locations
- Provides relevance scores and reasoning for each suggestion
- Review and accept AI suggestions or choose manual placement

### 11 Quality-Ranked Styles
Styles are organized by quality tier (S > A > B > C):

| Tier | Styles |
|------|--------|
| **S** (Flagship) | Hyper-Realism, Digital Art, Illustration |
| **A** (High) | 3D Render, Anime, Watercolor |
| **B** (Specialized) | Manga, Cinematic, Oil Painting |
| **C** (Niche) | Sketch, Pixel Art |

## Installation

### Via BRAT (Recommended for Beta Testing)

1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat) from Obsidian Community Plugins
2. Open BRAT settings
3. Click "Add Beta plugin"
4. Enter: `https://github.com/reallygood83/grokidian`
5. Click "Add Plugin"
6. Enable Grokidian in Community Plugins

### Manual Installation

1. Download the latest release from [GitHub Releases](https://github.com/reallygood83/grokidian/releases)
2. Extract to your vault's `.obsidian/plugins/grokidian/` folder
3. Reload Obsidian
4. Enable the plugin in Settings > Community Plugins

## Setup

1. Get your xAI API key from [console.x.ai](https://console.x.ai)
2. Open Grokidian settings in Obsidian
3. Enter your API key
4. Click "Test API Key" to verify

## Usage

### Commands

| Command | Description | Hotkey |
|---------|-------------|--------|
| **Generate Images (AI Auto)** | Fully automated generation | `Cmd/Ctrl+Shift+G` |
| **Generate Images from Selection** | Generate from selected text | `Cmd/Ctrl+Shift+S` |
| **Generate Images (Manual Mode)** | User controls all options | - |
| **Open Settings** | Jump to settings | - |

### Quick Start

1. Open any note with content
2. Press `Cmd/Ctrl+Shift+G` or click the ribbon icon
3. Review AI-detected concepts and generated prompt
4. Choose style and options
5. Click "Generate Images"
6. Accept AI placement suggestions or insert manually

## Settings

### Image Generation Defaults
- **Default Style**: Choose from 11 quality-ranked styles
- **Default Use Case**: Auto-detect or specific template
- **Aspect Ratio**: 16:9, 4:3, 1:1, 9:16, etc.
- **Number of Images**: 1-10 per generation
- **Insertion Mode**: AI Smart, Manual, or Ask Each Time

### Storage
- **Use Obsidian Attachment Folder**: Respect your Obsidian settings
- **Custom Path**: Override with custom location
- **Monthly Subfolders**: Organize by YYYY-MM
- **Timestamps**: Prevent filename conflicts

## Use Case Templates

| Template | Best For |
|----------|----------|
| Educational Diagram | Technical concepts, systems |
| Concept Visualization | Abstract ideas, theories |
| Process Flow | Workflows, algorithms |
| Character Illustration | Fiction, personas |
| Scene Setting | Environments, world-building |
| Data Visualization | Statistics, comparisons |
| Historical Recreation | Historical events, figures |
| Scientific Illustration | Biology, physics, chemistry |
| Architectural Visualization | Spaces, structures |
| Product Mockup | UI/UX, physical products |

## Requirements

- Obsidian v0.15.0 or later
- xAI API key (get one at [console.x.ai](https://console.x.ai))

## Privacy & Security

- **Local-First**: All images stored in your vault
- **No Telemetry**: Zero analytics or usage tracking
- **Secure Storage**: API key encrypted via Obsidian's secure storage
- **Transparent**: Generated prompts always shown for review

## Support

- [Report Issues](https://github.com/reallygood83/grokidian/issues)
- [Feature Requests](https://github.com/reallygood83/grokidian/issues/new)

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Made with AI by the Grokidian Team
