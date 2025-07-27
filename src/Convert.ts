import { Exception } from './Exception';

import { bookTemplate } from './types/bookTemplate';

import { renderPage } from './Render';

import path from 'path';
import { globbySync } from 'globby';

import fs from 'fs';

interface convertPageDTO {
  lang: string;
  title: string;
  inputPath: string;
  outputPath: string;
  staticPath: string;
  pageTemplate: string;
}

/**
 *
 * @param dto
 */

export function convertPage(dto: convertPageDTO) {
  if (!fs.existsSync(dto.inputPath)) throw new Exception('inputFileNotFound');

  const markdownText = fs.readFileSync(dto.inputPath, 'utf-8');

  const htmlText = renderPage({
    lang: dto.lang,
    title: dto.title,
    markdownText: markdownText,
    pageTemplate: dto.pageTemplate,
    staticPath: dto.staticPath,
  });

  fs.writeFileSync(dto.outputPath, htmlText, 'utf-8');
}

export type { convertPageDTO };

interface convertAllPagesDTO {
  lang: string;
  titles: Map<string, string>;
  inputDir: string;
  outputDir: string;
  staticPath: string;
  pageTemplate: string;
}

/**
 *
 * @param dto
 */

export function convertAllPages(dto: convertAllPagesDTO) {
  const filePaths = globbySync(
    path.join(dto.inputDir, './**/*.md').replace(/\\/g, '/'),
  );

  for (let filePath of filePaths) {
    const relativePath = path.normalize(path.relative(dto.inputDir, filePath));

    const outputPath = path.join(
      dto.outputDir,
      relativePath.replace(/(\.[^.]+)?$/, '.html'),
    );

    const staticPath = path.relative(path.dirname(outputPath), dto.staticPath);

    const title = dto.titles.has(relativePath)
      ? dto.titles.get(relativePath)!
      : 'none';

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    convertPage({
      lang: dto.lang,
      title: title,
      inputPath: filePath,
      outputPath: outputPath,
      staticPath: staticPath,
      pageTemplate: dto.pageTemplate,
    });
  }
}

export type { convertAllPagesDTO };

interface copyFilesDTO {
  inputDir: string;
  outputDir: string;
}

function copyFiles(dto: copyFilesDTO, patterns: string[]) {
  const filePaths = globbySync([
    path.join(dto.inputDir, './**/*').replace(/\\/g, '/'),
    '!' + path.join(dto.outputDir, './**/*').replace(/\\/g, '/'),
    ...patterns,
  ]);

  for (let filePath of filePaths) {
    const relativePath = path.relative(dto.inputDir, filePath);
    const outputPath = path.join(dto.outputDir, relativePath);

    if (!fs.existsSync(path.dirname(outputPath)))
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    fs.copyFileSync(filePath, outputPath);
  }
}

interface convertBookDTO {
  lang: string;
  titles: Map<string, string>;
  inputDir: string;
  outputDir: string;
  template: bookTemplate;
}

/**
 *
 * @param dto
 */

export function convertBook(dto: convertBookDTO) {
  copyFiles(
    {
      inputDir: dto.inputDir,
      outputDir: dto.outputDir,
    },
    ['!**/*.md', '!**/SUMMARY.yaml', '!**/BOOK.yaml'],
  );

  const staticPath = path.join(dto.outputDir, './static/');

  copyFiles(
    {
      inputDir: dto.template.staticPath,
      outputDir: staticPath,
    },
    [],
  );

  convertAllPages({
    lang: dto.lang,
    titles: dto.titles,
    inputDir: dto.inputDir,
    outputDir: dto.outputDir,
    pageTemplate: dto.template.pageTemplate,
    staticPath: staticPath,
  });
}
