export type SkillId =
  | 'decomposition'
  | 'systems-thinking'
  | 'pattern-recognition'
  | 'precision-of-language'
  | 'giving-feedback'
  | 'specification-writing'
  | 'rapid-prototyping'
  | 'debugging-with-ai'
  | 'remix-and-extend'
  | 'ai-literacy';

export type SkillCategory = 'thinking' | 'communication' | 'building' | 'meta';

export interface Skill {
  id: SkillId;
  name: string;
  icon: string;
  shortDescription: string;
  parentExplanation: string;
  category: SkillCategory;
}

export const SKILLS: Skill[] = [
  // Thinking
  {
    id: 'decomposition',
    name: 'Decomposition',
    icon: '🧩',
    shortDescription: 'Breaking big problems into small pieces',
    parentExplanation:
      'Your child is learning to take a complex challenge and split it into manageable steps — the single most important skill when working with AI.',
    category: 'thinking',
  },
  {
    id: 'systems-thinking',
    name: 'Systems Thinking',
    icon: '🔗',
    shortDescription: 'Understanding how parts connect and affect each other',
    parentExplanation:
      'Your child is learning that changing one thing in a system affects other parts — exactly how real software and AI models work.',
    category: 'thinking',
  },
  {
    id: 'pattern-recognition',
    name: 'Pattern Recognition',
    icon: '🔍',
    shortDescription: 'Seeing what repeats and knowing how to reuse it',
    parentExplanation:
      'Your child is learning to spot patterns and avoid repeating themselves — a core skill in both programming and working efficiently with AI.',
    category: 'thinking',
  },
  // Communication
  {
    id: 'precision-of-language',
    name: 'Precision of Language',
    icon: '🎯',
    shortDescription: 'Saying exactly what you mean so the AI understands',
    parentExplanation:
      'Your child is learning that vague instructions get vague results. Precise, specific language is the foundation of prompt engineering.',
    category: 'communication',
  },
  {
    id: 'giving-feedback',
    name: 'Giving Feedback',
    icon: '💬',
    shortDescription: 'Seeing what is wrong and describing the fix clearly',
    parentExplanation:
      'Your child is learning to evaluate AI output critically and articulate what needs to change — a skill that makes them a better collaborator.',
    category: 'communication',
  },
  {
    id: 'specification-writing',
    name: 'Specification Writing',
    icon: '📋',
    shortDescription: 'Describing what done looks like before you start',
    parentExplanation:
      'Your child is learning to define success upfront — the difference between professionals who get great AI results and those who get mediocre ones.',
    category: 'communication',
  },
  // Building
  {
    id: 'rapid-prototyping',
    name: 'Rapid Prototyping',
    icon: '⚡',
    shortDescription: 'Building something that works, then making it better',
    parentExplanation:
      'Your child is learning that done is better than perfect — build a rough version fast, then improve it. This is how real products are made.',
    category: 'building',
  },
  {
    id: 'debugging-with-ai',
    name: 'Debugging with AI',
    icon: '🐛',
    shortDescription: 'Finding what broke and describing it so the AI can fix it',
    parentExplanation:
      'Your child is learning that fixing problems is 80% of real building work. Describing bugs clearly is a superpower.',
    category: 'building',
  },
  {
    id: 'remix-and-extend',
    name: 'Remix & Extend',
    icon: '🎨',
    shortDescription: 'Taking something that exists and making it yours',
    parentExplanation:
      'Your child is learning to build on existing work rather than starting from scratch — a core skill in modern software development.',
    category: 'building',
  },
  // Meta
  {
    id: 'ai-literacy',
    name: 'AI Literacy',
    icon: '🤖',
    shortDescription: 'Knowing what AI can and cannot do, and when to question it',
    parentExplanation:
      'Your child is learning to be a critical consumer of AI output — not just accepting what the AI produces, but evaluating it thoughtfully.',
    category: 'meta',
  },
];

export function getSkillById(id: SkillId): Skill | undefined {
  return SKILLS.find(s => s.id === id);
}

export const SKILL_CATEGORIES: { id: SkillCategory; label: string; icon: string }[] = [
  { id: 'thinking', label: 'Thinking Skills', icon: '🧠' },
  { id: 'communication', label: 'Communication Skills', icon: '🗣️' },
  { id: 'building', label: 'Building Skills', icon: '🔧' },
  { id: 'meta', label: 'Meta Skills', icon: '🌍' },
];
