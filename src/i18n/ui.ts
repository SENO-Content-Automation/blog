import type { Lang } from '../consts';

/** UI chrome is English on every route. Only the post bodies differ by language. */
export const ui = {
  'nav.posts': 'Posts',
  'nav.categories': 'Categories',
  'nav.tags': 'Tags',
  'site.desc': 'Notes on safety engineering for AI-powered robots',
  'post.updated': 'Updated',
  'post.readAll': 'All posts',
  'post.minRead': 'min read',
  'tags.title': 'Tags',
  'tags.postsWith': 'Posts tagged',
  'empty': 'No posts yet.',
} as const;

export type UIKey = keyof typeof ui;

/** lang은 받지만 무시합니다. 나중에 언어별로 나누고 싶어지면 여기만 바꾸면 됩니다. */
export function t(_lang: Lang) {
  return (key: UIKey) => ui[key];
}

/** 언어 전환 링크에 쓰는 이름은 각 언어 표기 그대로 두는 게 관례입니다. */
export const langLabel: Record<Lang, string> = {
  ko: '한국어',
  en: 'English',
};

export const otherLang = (lang: Lang): Lang => (lang === 'ko' ? 'en' : 'ko');
