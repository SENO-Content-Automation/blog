import type { Lang } from '../consts';

/**
 * 본문에서 조판 요소를 걷어내고 읽는 데 걸리는 시간을 분 단위로 냅니다.
 *
 * 한국어는 단어가 아니라 글자로 셉니다. 기준은 분당 500자 — 일반 산문(700~1000자)이
 * 아니라 기술 문서 속도입니다. 표와 인용된 조문을 되짚어 읽는 시간을 감안한 값입니다.
 * 영문은 분당 200단어.
 *
 * 표는 같은 글자 수라도 훨씬 느리게 읽히므로 행 수만큼 가중치를 더합니다.
 */
export function readingMinutes(body: string, lang: Lang): number {
  const tableRows = (body.match(/^\s*\|.*\|\s*$/gm) || []).length;

  const text = body
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')   // 다이어그램은 읽는 시간이 아니라 보는 시간
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // 링크는 텍스트만 남김
    .replace(/[#>*_`|~-]/g, ' ');

  let units: number;
  if (lang === 'ko') {
    const hangul = (text.match(/[가-힣]/g) || []).length;
    const latin = (text.match(/[A-Za-z0-9]/g) || []).length;
    units = (hangul + latin / 2.5) / 500;
  } else {
    units = text.trim().split(/\s+/).filter(Boolean).length / 200;
  }

  return Math.max(1, Math.round(units + tableRows * 0.04));
}
