import { StyleTemplate, StyleTier } from '../api/types';

export const STYLE_TEMPLATES: StyleTemplate[] = [
  // Tier S - Flagship Quality
  {
    id: 'hyper_realism',
    name: 'Hyper-Realism',
    tier: 'S',
    modifier: 'In hyper-realistic photographic style with extreme detail and professional lighting,',
    qualityEnhancers: 'professional photography, studio lighting, extreme detail, 8K resolution',
    bestFor: ['Product mockups', 'Technical precision', 'Realistic scenes', 'Educational accuracy'],
    icon: '📸'
  },
  {
    id: 'digital_art',
    name: 'Digital Art',
    tier: 'S',
    modifier: 'In modern digital painting style with rich colors and painterly textures,',
    qualityEnhancers: 'highly detailed, modern digital painting, vibrant colors, professional quality',
    bestFor: ['Concept visualization', 'Artistic scenes', 'Landscapes', 'Abstract ideas'],
    icon: '🎨'
  },
  {
    id: 'illustration',
    name: 'Illustration',
    tier: 'S',
    modifier: 'In clean editorial illustration style with vector-like clarity and modern design,',
    qualityEnhancers: 'vector-like clarity, clean lines, editorial quality, professional illustration',
    bestFor: ['Infographics', 'Educational diagrams', 'Process flows', 'Clean concepts'],
    icon: '✏️'
  },

  // Tier A - High Quality
  {
    id: '3d_render',
    name: '3D Render',
    tier: 'A',
    modifier: 'In professional 3D rendered style with realistic materials and lighting,',
    qualityEnhancers: 'professional 3D rendering, realistic materials, raytracing, high quality',
    bestFor: ['Technical visualization', 'Product mockups', 'Architectural concepts'],
    icon: '🎲'
  },
  {
    id: 'anime',
    name: 'Anime',
    tier: 'A',
    modifier: 'In vibrant anime art style with expressive characters and dynamic composition,',
    qualityEnhancers: 'anime style, expressive, vibrant colors, dynamic poses, high quality',
    bestFor: ['Characters', 'Narrative scenes', 'Action sequences', 'Engaging visuals'],
    icon: '🌸'
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    tier: 'A',
    modifier: 'In delicate watercolor painting style with soft washes and organic textures,',
    qualityEnhancers: 'watercolor painting, soft washes, organic textures, artistic quality',
    bestFor: ['Nature', 'Abstract concepts', 'Gentle scenes', 'Artistic presentations'],
    icon: '💧'
  },

  // Tier B - Specialized
  {
    id: 'manga',
    name: 'Manga',
    tier: 'B',
    modifier: 'In detailed manga illustration style with dramatic compositions and expressive characters,',
    qualityEnhancers: 'manga style, detailed linework, dramatic composition, expressive',
    bestFor: ['Storytelling', 'Character designs', 'Action sequences', 'Comics'],
    icon: '📖'
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    tier: 'B',
    modifier: 'In dramatic cinematic style with movie-quality composition and lighting,',
    qualityEnhancers: 'cinematic composition, dramatic lighting, movie quality, epic scale',
    bestFor: ['Dramatic scenes', 'Epic moments', 'Movie-poster aesthetic', 'Storytelling'],
    icon: '🎬'
  },
  {
    id: 'oil_painting',
    name: 'Oil Painting',
    tier: 'B',
    modifier: 'In classical oil painting style with rich textures and masterful brushwork,',
    qualityEnhancers: 'oil painting, classical style, rich textures, masterful brushwork',
    bestFor: ['Classical art', 'Portraits', 'Historical recreations', 'Timeless scenes'],
    icon: '🖼️'
  },

  // Tier C - Niche
  {
    id: 'sketch',
    name: 'Sketch',
    tier: 'C',
    modifier: 'In artistic sketch style with hand-drawn lines and gestural marks,',
    qualityEnhancers: 'pencil sketch, hand-drawn, gestural, artistic',
    bestFor: ['Rough concepts', 'Ideation', 'Hand-drawn aesthetic', 'Draft visuals'],
    icon: '📝'
  },
  {
    id: 'pixel_art',
    name: 'Pixel Art',
    tier: 'C',
    modifier: 'In detailed pixel art style with retro gaming aesthetic,',
    qualityEnhancers: 'pixel art, retro style, detailed pixels, gaming aesthetic',
    bestFor: ['Retro themes', 'Game design', 'Nostalgia content', '8-bit aesthetic'],
    icon: '👾'
  },
];

export function getStyleById(id: string): StyleTemplate | undefined {
  return STYLE_TEMPLATES.find(style => style.id === id);
}

export function getStylesByTier(tier: StyleTier): StyleTemplate[] {
  return STYLE_TEMPLATES.filter(style => style.tier === tier);
}

export function getDefaultStyle(): StyleTemplate {
  return STYLE_TEMPLATES[0]; // Hyper-Realism
}
