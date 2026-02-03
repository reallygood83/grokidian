import { StyleTemplate, StyleTier } from '../api/types';
import { STYLE_TEMPLATES, getStyleById, getDefaultStyle } from '../constants/styles';

export class StyleManager {
  private lastUsedStyleId: string | null = null;

  getStyleById(id: string): StyleTemplate | undefined {
    return getStyleById(id);
  }

  getDefaultStyle(): StyleTemplate {
    return getDefaultStyle();
  }

  getAllStyles(): StyleTemplate[] {
    return STYLE_TEMPLATES;
  }

  getStylesByTier(tier: StyleTier): StyleTemplate[] {
    return STYLE_TEMPLATES.filter(style => style.tier === tier);
  }

  getStylesGroupedByTier(): Map<StyleTier, StyleTemplate[]> {
    const grouped = new Map<StyleTier, StyleTemplate[]>();
    const tiers: StyleTier[] = ['S', 'A', 'B', 'C'];
    
    for (const tier of tiers) {
      grouped.set(tier, this.getStylesByTier(tier));
    }
    
    return grouped;
  }

  setLastUsedStyle(styleId: string): void {
    this.lastUsedStyleId = styleId;
  }

  getLastUsedStyle(): StyleTemplate {
    if (this.lastUsedStyleId) {
      const style = this.getStyleById(this.lastUsedStyleId);
      if (style) return style;
    }
    return this.getDefaultStyle();
  }

  recommendStyleForUseCase(useCaseBestStyles: string[]): StyleTemplate {
    for (const styleId of useCaseBestStyles) {
      const style = this.getStyleById(styleId);
      if (style) return style;
    }
    return this.getDefaultStyle();
  }

  getTierLabel(tier: StyleTier): string {
    const labels: Record<StyleTier, string> = {
      'S': 'Flagship Quality',
      'A': 'High Quality',
      'B': 'Specialized',
      'C': 'Niche'
    };
    return labels[tier];
  }

  getTierDescription(tier: StyleTier): string {
    const descriptions: Record<StyleTier, string> = {
      'S': 'Best for educational and professional content',
      'A': 'Excellent for specialized use cases',
      'B': 'Strong for specific content types',
      'C': 'Use case specific styles'
    };
    return descriptions[tier];
  }

  formatStyleOption(style: StyleTemplate): string {
    return `[${style.tier}] ${style.icon} ${style.name}`;
  }

  getStyleDescription(style: StyleTemplate): string {
    return `Best for: ${style.bestFor.join(', ')}`;
  }
}
