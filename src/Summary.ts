import { z } from 'zod';
import { Exception } from './Exception';

import path from 'path';

type summarySchemaType = {
  [key: string]: string | summarySchemaType;
};

const summarySchema: z.ZodType<summarySchemaType> = z.record(
  z.string(),
  z.union([z.string(), z.lazy(() => summarySchema)]),
);

function recursiveParseTitles(
  summaryObj: summarySchemaType,
  mapObj: Map<string, string>,
) {
  for (let fileName of Object.keys(summaryObj)) {
    const item = summaryObj[fileName];

    if (typeof item === 'string') {
      fileName = path.normalize(fileName);
      if (mapObj.has(fileName)) throw new Exception('pathInSummaryDuplicated');
      mapObj.set(fileName, item);
    } else {
      recursiveParseTitles(item, mapObj);
    }
  }
}

export function parseSummary(summaryObject: unknown) {
  return summarySchema.parse(summaryObject);
}

export function parseTitles(summary: summarySchemaType): Map<string, string> {
  const titles = new Map<string, string>();

  recursiveParseTitles(summary, titles);

  return titles;
}
