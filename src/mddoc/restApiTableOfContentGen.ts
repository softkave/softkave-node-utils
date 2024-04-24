import * as fse from 'fs-extra';
import {forEach} from 'lodash';
import path from 'path';
import {AppExportedHttpEndpoints} from '../endpoints/endpoints';

function generateTableOfContentFromEndpoints(
  endpoints: AppExportedHttpEndpoints
) {
  const tableOfContent: Array<[string, string]> = [];

  forEach(endpoints, e1 => {
    tableOfContent.push([
      e1.mddocHttpDefinition.assertGetBasePathname(),
      e1.mddocHttpDefinition.assertGetMethod(),
    ]);
  });

  return tableOfContent;
}

export async function restApiTableOfContentGen(
  endpoints: AppExportedHttpEndpoints
) {
  const basepath = './mdoc/rest-api/toc/v1';
  const tableOfContentFilename = path.normalize(
    basepath + '/table-of-content.json'
  );
  const tableOfContent = generateTableOfContentFromEndpoints(endpoints);

  await fse.ensureFile(tableOfContentFilename);
  return await fse.writeFile(
    tableOfContentFilename,
    JSON.stringify(tableOfContent, undefined, 4),
    {encoding: 'utf-8'}
  );
}
