import markdownit from 'markdown-it';
import mk from '@vscode/markdown-it-katex';

let md = markdownit({
  html: true,
  linkify: false,
});

md.use(mk);

md.renderer.rules.link_open = function (
  tokens: markdownit.Token[],
  idx: number,
  options: markdownit.Options,
  env: any,
  self: markdownit.Renderer,
): string {
  const token = tokens[idx];
  const hrefIndex = token.attrIndex('href');

  if (hrefIndex >= 0 && token.attrs) {
    let href = token.attrs[hrefIndex][1] as string;

    const [path, hash] = href.split('#');

    if (
      !href.startsWith('http') &&
      !href.startsWith('//') &&
      !href.startsWith('mailto:') &&
      path.endsWith('.md')
    ) {
      const newPath = path.replace(/\.md$/, '.html');
      const newHref = hash ? `${newPath}#${hash}` : newPath;
      token.attrs[hrefIndex][1] = newHref;
    }
  }

  return self.renderToken(tokens, idx, options);
};

interface renderPageDTO {
  staticPath: string;
  pageTemplate: string;
  lang: string;
  title: string;
  markdownText: string;
}

export function renderPage(dto: renderPageDTO) {
  const content = md.render(dto.markdownText);

  const vars = new Map<string, string>([
    ['lang', dto.lang],
    ['title', dto.title],
    ['content', content],
    ['static_path', dto.staticPath.replace(/\\/g, '/')],
  ]);

  const result = dto.pageTemplate.replace(/{{(\w+)}}/g, (match, key) => {
    return vars.has(key) ? vars.get(key)! : match;
  });

  return result;
}

export type { renderPageDTO };
