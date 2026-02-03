import { UseCaseTemplate, UseCaseTemplateId } from '../api/types';

export const USE_CASE_TEMPLATES: UseCaseTemplate[] = [
  {
    id: 'educational_diagram',
    name: 'Educational Diagram',
    icon: '📊',
    description: 'Technical concepts, processes, systems, frameworks',
    bestStyles: ['illustration', 'digital_art', 'hyper_realism'],
    promptPattern: 'create a detailed educational diagram illustrating {concepts} showing {relationships} with clear labels and visual hierarchy',
    keywords: ['learn', 'teach', 'explain', 'concept', 'framework', 'system', 'principle', 'theory', 'fundamentals', 'basics', 'introduction', 'guide', 'tutorial']
  },
  {
    id: 'concept_visualization',
    name: 'Concept Visualization',
    icon: '💡',
    description: 'Abstract ideas, theories, mental models',
    bestStyles: ['digital_art', 'watercolor', 'illustration'],
    promptPattern: 'visualize the concept of {concepts} incorporating {elements} in an abstract yet clear composition',
    keywords: ['idea', 'theory', 'abstract', 'mental', 'model', 'philosophy', 'thinking', 'understanding', 'perception', 'cognition']
  },
  {
    id: 'process_flow',
    name: 'Process Flow',
    icon: '➡️',
    description: 'Step-by-step procedures, workflows, algorithms',
    bestStyles: ['illustration', 'digital_art', '3d_render'],
    promptPattern: 'create a step-by-step process flow diagram showing {process} with sequential stages',
    keywords: ['step', 'process', 'flow', 'workflow', 'procedure', 'algorithm', 'sequence', 'pipeline', 'stages', 'phases']
  },
  {
    id: 'character_illustration',
    name: 'Character Illustration',
    icon: '👤',
    description: 'Fiction writing, personas, character designs',
    bestStyles: ['anime', 'digital_art', 'manga', 'hyper_realism'],
    promptPattern: 'create a full character illustration of {character} with {traits} emphasizing distinctive features',
    keywords: ['character', 'person', 'protagonist', 'hero', 'villain', 'persona', 'figure', 'portrait', 'individual']
  },
  {
    id: 'scene_setting',
    name: 'Scene Setting',
    icon: '🌄',
    description: 'Environment descriptions, world-building, atmosphere',
    bestStyles: ['digital_art', 'cinematic', 'watercolor', 'oil_painting'],
    promptPattern: 'create an atmospheric scene depicting {setting} featuring {elements} with strong environmental storytelling',
    keywords: ['scene', 'environment', 'landscape', 'setting', 'world', 'place', 'location', 'atmosphere', 'mood', 'ambiance']
  },
  {
    id: 'data_visualization',
    name: 'Data Visualization',
    icon: '📈',
    description: 'Statistics, comparisons, relationships, metrics',
    bestStyles: ['illustration', 'digital_art', '3d_render'],
    promptPattern: 'create a clear data visualization comparing {data} with intuitive visual encoding',
    keywords: ['data', 'statistics', 'graph', 'chart', 'metrics', 'numbers', 'comparison', 'analysis', 'trend', 'growth']
  },
  {
    id: 'historical_recreation',
    name: 'Historical Recreation',
    icon: '🏛️',
    description: 'Historical events, figures, periods, artifacts',
    bestStyles: ['hyper_realism', 'oil_painting', 'digital_art'],
    promptPattern: 'create a historically accurate recreation of {subject} with period-appropriate details',
    keywords: ['history', 'historical', 'ancient', 'medieval', 'period', 'era', 'century', 'civilization', 'empire', 'dynasty']
  },
  {
    id: 'scientific_illustration',
    name: 'Scientific Illustration',
    icon: '🔬',
    description: 'Biology, chemistry, physics concepts, technical accuracy',
    bestStyles: ['hyper_realism', 'illustration', 'digital_art', '3d_render'],
    promptPattern: 'create a detailed scientific illustration of {subject} with technical accuracy and clear annotations',
    keywords: ['science', 'biology', 'chemistry', 'physics', 'cell', 'molecule', 'atom', 'organism', 'experiment', 'research']
  },
  {
    id: 'architectural_visualization',
    name: 'Architectural Visualization',
    icon: '🏗️',
    description: 'Spaces, structures, designs, interior/exterior',
    bestStyles: ['3d_render', 'hyper_realism', 'illustration'],
    promptPattern: 'create an architectural visualization of {structure} with professional rendering quality',
    keywords: ['architecture', 'building', 'structure', 'design', 'interior', 'exterior', 'space', 'room', 'house', 'construction']
  },
  {
    id: 'product_mockup',
    name: 'Product Mockup',
    icon: '📦',
    description: 'UI/UX, physical products, prototypes, designs',
    bestStyles: ['hyper_realism', '3d_render', 'illustration'],
    promptPattern: 'create a professional product mockup of {product} with clean presentation',
    keywords: ['product', 'mockup', 'prototype', 'design', 'ui', 'ux', 'interface', 'app', 'device', 'gadget']
  }
];

export function getUseCaseById(id: UseCaseTemplateId): UseCaseTemplate | undefined {
  return USE_CASE_TEMPLATES.find(uc => uc.id === id);
}

export function getDefaultUseCase(): UseCaseTemplate {
  return USE_CASE_TEMPLATES[1]; // Concept Visualization as default fallback
}
