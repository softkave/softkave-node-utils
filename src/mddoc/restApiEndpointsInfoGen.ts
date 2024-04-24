import * as fse from 'fs-extra';
import {forEach, isFunction, isObject} from 'lodash';
import {posix} from 'path';
import {AnyFn, AnyObject, mergeObjects} from 'softkave-js-utils';
import {AppExportedHttpEndpoints} from '../endpoints/endpoints';
import {
  mddocEndpointHttpHeaderItems,
  mddocEndpointHttpResponseItems,
} from '../endpoints/endpoints.mddoc';
import {MddocHttpEndpointDefinition} from './mddoc';

function getNonFuncFields(obj: AnyObject, skipFieldsWithPrefix: string[]) {
  const fields: string[] = [];

  for (const key in obj) {
    if (
      isFunction(obj[key]) ||
      skipFieldsWithPrefix.some(prefix => key.startsWith(prefix))
    ) {
      continue;
    }

    fields.push(key);
  }

  return fields;
}

export function extractNonFuncFieldsFromObj(
  obj: unknown,
  skipFieldsWithPrefix: string[],
  /**
   * `Param 0` is raw object,
   * `Param 1` is extracted object,
   * `Result` is object to merge with extracted object
   */
  augmenter: AnyFn<[AnyObject, AnyObject], AnyObject> = () => ({})
) {
  if (!isObject(obj)) {
    return obj;
  }

  const extractedObj: AnyObject = {};
  const fields = getNonFuncFields(obj, skipFieldsWithPrefix);
  fields.forEach(key => {
    extractedObj[key] = extractNonFuncFieldsFromObj(
      (obj as AnyObject)[key],
      skipFieldsWithPrefix,
      augmenter
    );
  });

  const augment = augmenter(obj, extractedObj);
  return mergeObjects(extractedObj, augment, {arrayUpdateStrategy: 'replace'});
}

function generateEndpointInfoFromEndpoints(
  endpoints: AppExportedHttpEndpoints
) {
  const infoMap = new Map<MddocHttpEndpointDefinition, string>();

  forEach(endpoints, endpoint => {
    const info = extractNonFuncFieldsFromObj(
      endpoint.mddocHttpDefinition
        .setErrorResponseHeaders(
          mddocEndpointHttpHeaderItems.responseHeaders_JsonContentType
        )
        .setErrorResponseBody(mddocEndpointHttpResponseItems.errorResponseBody),
      /** skip fields prefix */ []
    );
    infoMap.set(
      endpoint.mddocHttpDefinition as any,
      JSON.stringify(info, /** replacer */ undefined, /** spaces */ 4)
    );
  });

  return infoMap;
}

async function writeEndpointInfoToFile(endpointPath: string, info: string) {
  await fse.ensureFile(endpointPath);
  return fse.writeFile(endpointPath, info, {encoding: 'utf-8'});
}

export async function restApiEndpointsInfoGen(
  endpoints: AppExportedHttpEndpoints
) {
  const basepath = './mdoc/rest-api/endpoints';
  const infoMap = generateEndpointInfoFromEndpoints(endpoints);
  const promises: Promise<void>[] = [];

  await fse.remove(basepath);

  infoMap.forEach((info, endpoint) => {
    const pathname = endpoint.assertGetBasePathname();
    const method = endpoint.assertGetMethod();
    const filename = `${pathname}__${method}.json`;
    const endpointPath = posix.normalize(basepath + filename);
    promises.push(writeEndpointInfoToFile(endpointPath, info));
  });

  return Promise.all(promises);
}
