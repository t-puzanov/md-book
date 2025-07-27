import { bookTemplate } from './types/bookTemplate';
import { convertBook } from './Convert';

import { parseSummary, parseTitles } from './Summary';
import { parseConfig } from './Config';

import path from 'path';
import fs from 'fs';

import yaml from 'js-yaml';

import { program } from 'commander';

const cwd = process.cwd();

const templateDir = path.join(__dirname, '../../templates/base/');

const template: bookTemplate = {
  pageTemplate: fs.readFileSync(path.join(templateDir, 'page.html'), 'utf-8'),
  staticPath: path.join(templateDir, './static/'),
};

program
  .command('convert')
  .argument('<inputDir>', 'input dir')
  .argument('<outputDir>', 'output dir')
  .action((inputDir: string, outputDir: string) => {
    const absInputDirPath = path.join(cwd, inputDir);
    const absOutputDirPath = path.join(cwd, outputDir);

    const summaryFileContent = fs.readFileSync(
      path.join(absInputDirPath, 'SUMMARY.yaml'),
      'utf-8',
    );

    const configFileContent = fs.readFileSync(
      path.join(absInputDirPath, 'BOOK.yaml'),
      'utf-8',
    );

    const summaryObject = yaml.load(summaryFileContent);
    const summary = parseSummary(summaryObject);

    const titles = parseTitles(summary);

    const configObject = yaml.load(configFileContent);
    const config = parseConfig(configObject);

    convertBook({
      lang: config.lang,
      titles: titles,
      inputDir: absInputDirPath,
      outputDir: absOutputDirPath,
      template: template,
    });
  });

program.parse(process.argv);
