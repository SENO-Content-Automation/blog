/**
 * 카테고리 = "이 글이 무엇에 대한 글인가" (글당 1개)
 * 태그     = "이 글이 무엇을 다뤘나"     (글당 여러 개)
 *
 * 앞의 네 개는 순서 자체가 의미입니다:
 *   요구 → 위험 → 대응 → 증명  (= 안전성 검증의 작업 순서)
 * 마지막 하나는 그 대상이 되는 기술입니다.
 *
 * 색으로 구분하지 않습니다. 사이트가 무채색이라 카테고리는
 * 라벨과 배열 순서로만 구분됩니다 (Monochrome System v2.0).
 *
 * 여기 없는 값을 글에 쓰면 빌드가 실패합니다 (content.config.ts의 z.enum).
 */
export const CATEGORY_SLUGS = [
  'standards',
  'failure-modes',
  'safety-architecture',
  'verification',
  'robot-ai',
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export interface CategoryMeta {
  label: string;
  question: string;
}

export const CATEGORIES: Record<CategorySlug, CategoryMeta> = {
  'standards': {
    label: 'Standards & Regulation',
    question: 'What is required?',
  },
  'failure-modes': {
    label: 'AI Failure Modes',
    question: 'What can go wrong?',
  },
  'safety-architecture': {
    label: 'Safety Architecture',
    question: 'How do we prevent it?',
  },
  'verification': {
    label: 'Verification & Evidence',
    question: 'How do we prove it?',
  },
  'robot-ai': {
    label: 'Robot AI',
    question: 'The technology itself',
  },
};

export const categoryLabel = (slug: CategorySlug) => CATEGORIES[slug].label;
