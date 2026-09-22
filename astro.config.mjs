// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

/* 표를 스크롤 가능한 div로 감쌉니다.
   table 자체에 display:block 을 주면 가로 스크롤은 되지만 행이 늘어나지 않아
   내용이 짧은 표가 왼쪽에 쪼그라듭니다(테두리만 100%). 감싸는 쪽이 스크롤하고
   표는 display:table 로 둬야 width:100% 가 실제로 먹습니다. */
function rehypeTableWrap() {
  return (tree) => {
    const walk = (node) => {
      if (!node.children) return;
      node.children = node.children.map((child) => {
        walk(child);
        if (child.type === 'element' && child.tagName === 'table') {
          return {
            type: 'element',
            tagName: 'div',
            properties: { className: ['table-wrap'] },
            children: [child],
          };
        }
        return child;
      });
    };
    walk(tree);
  };
}

export default defineConfig({
  // ⬇⬇⬇ 도메인 사서 연결한 뒤 여기만 바꾸면 됩니다 ⬇⬇⬇
  site: 'https://safetynode.vercel.app',

  integrations: [mdx(), sitemap()],

  // 루트(/)로 들어오면 한국어 홈으로 보냅니다
  // (영어 글이 쌓이면 '/en/'으로 되돌리고 consts.ts의 DEFAULT_LANG도 함께 변경)
  redirects: {
    '/': '/ko/',
  },

  markdown: {
    rehypePlugins: [rehypeTableWrap],
    shikiConfig: {
      // 라이트/다크 모두 대응
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
      wrap: true,
    },
  },
});
