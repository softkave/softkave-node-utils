import {execSync} from 'child_process';
import * as fse from 'fs-extra';
import {compact, forEach, last, nth, set, uniq, upperFirst} from 'lodash';
import {AnyObject, isObjectEmpty, pathSplit} from 'softkave-js-utils';
import {AppExportedHttpEndpoints} from '../endpoints/endpoints';
import {
  MddocFieldArray,
  MddocFieldObject,
  MddocFieldOrCombination,
  MddocFieldString,
  MddocHttpEndpointDefinition,
  mddocAssertion,
  mddocConstruct,
} from './mddoc';
import path = require('path');
import assert = require('assert');

class Doc {
  protected disclaimer =
    '// This file is auto-generated, do not modify directly. \n' +
    '// Reach out to @abayomi to suggest changes.\n';
  protected endpointsText = '';
  protected typesText = '';
  protected docImports: Record<string, {importing: string[]; from: string}> =
    {};
  protected docTypeImports: Record<
    string,
    {importing: string[]; from: string}
  > = {};
  protected classes: Record<
    string,
    {entries: string[]; name: string; extendsName?: string}
  > = {};

  generatedTypeCache: Map<string, boolean> = new Map();

  constructor(protected genTypesFilename: string) {}

  appendType(typeText: string) {
    this.typesText += typeText + '\n';
    return this;
  }

  appendEndpoint(endpoint: string) {
    this.endpointsText += endpoint + '\n';
    return this;
  }

  appendImport(importing: Array<string>, from: string) {
    let entry = this.docImports[from];
    if (!entry) {
      entry = {from, importing};
      this.docImports[from] = entry;
    } else {
      entry.importing = uniq(entry.importing.concat(importing));
    }

    return this;
  }

  appendTypeImport(importing: Array<string>, from: string) {
    let entry = this.docTypeImports[from];

    if (!entry) {
      entry = {from, importing};
      this.docTypeImports[from] = entry;
    } else {
      entry.importing = uniq(entry.importing.concat(importing));
    }

    return this;
  }

  appendImportFromGenTypes(importing: string[]) {
    return this.appendImport(importing, this.genTypesFilename);
  }

  appendToClass(entry: string, name: string, extendsName?: string) {
    let classEntry = this.classes[name];

    if (!classEntry) {
      classEntry = {name, extendsName, entries: [entry]};
      this.classes[name] = classEntry;
    } else {
      if (extendsName && extendsName !== classEntry.extendsName) {
        classEntry.extendsName = extendsName;
      }

      classEntry.entries.push(entry);
    }

    return this;
  }

  compileText() {
    return (
      this.disclaimer +
      '\n' +
      this.compileImports() +
      '\n' +
      this.compileTypeImports() +
      '\n' +
      this.typesText +
      '\n' +
      this.endpointsText +
      '\n' +
      this.compileClasses()
    );
  }

  protected compileImports() {
    let importsText = '';

    for (const from in this.docImports) {
      const {importing} = this.docImports[from];
      importsText += `import {${importing.join(', ')}} from "${from}"\n`;
    }

    return importsText;
  }

  protected compileTypeImports() {
    let importsText = '';

    for (const from in this.docTypeImports) {
      const {importing} = this.docTypeImports[from];
      importsText += `import type {${importing.join(', ')}} from "${from}"\n`;
    }

    return importsText;
  }

  protected compileClasses() {
    let classesText = '';

    for (const name in this.classes) {
      const {entries, extendsName} = this.classes[name];
      const extendsText = extendsName ? ` extends ${extendsName}` : '';
      classesText += `export class ${name}${extendsText} {\n`;
      entries.forEach(fieldEntry => {
        classesText += `  ${fieldEntry}\n`;
      });
      classesText += '}\n';
    }

    return classesText;
  }
}

function getEnumType(doc: Doc, item: MddocFieldString) {
  const name = item.getEnumName();
  if (name && doc.generatedTypeCache.has(name)) {
    return name;
  }

  const text = item
    .assertGetValid()
    .map(next => `"${next}"`)
    .join(' | ');

  if (name) {
    doc.generatedTypeCache.set(name, true);
    doc.appendType(`export type ${name} = ${text}`);
    return name;
  }

  return text;
}

function getStringType(doc: Doc, item: MddocFieldString) {
  return item.getValid()?.length ? getEnumType(doc, item) : 'string';
}

function getNumberType() {
  return 'number';
}

function getBooleanType() {
  return 'boolean';
}

function getNullType() {
  return 'null';
}

function getUndefinedType() {
  return 'undefined';
}

function getDateType() {
  return 'number';
}

function getArrayType(doc: Doc, item: MddocFieldArray<any>) {
  const ofType = item.assertGetType();
  const typeString = getType(
    doc,
    ofType,
    /** asFetchResponseIfFieldBinary */ false
  );
  return `Array<${typeString}>`;
}

function getOrCombinationType(doc: Doc, item: MddocFieldOrCombination) {
  return item
    .assertGetTypes()
    .map(next => getType(doc, next, /** asFetchResponseIfFieldBinary */ false))
    .join(' | ');
}

function getBinaryType(doc: Doc, asFetchResponse: boolean) {
  if (asFetchResponse) {
    doc.appendTypeImport(['Readable'], 'stream');
    return 'Blob | Readable';
  } else {
    doc.appendTypeImport(['Readable'], 'stream');
    return 'string | Readable | Blob';
  }
}

function getType(
  doc: Doc,
  item: unknown,
  asFetchResponseIfFieldBinary: boolean
): string {
  if (mddocAssertion.isFieldString(item)) {
    return getStringType(doc, mddocConstruct.constructFieldString(item));
  } else if (mddocAssertion.isFieldNumber(item)) {
    return getNumberType();
  } else if (mddocAssertion.isFieldBoolean(item)) {
    return getBooleanType();
  } else if (mddocAssertion.isFieldNull(item)) {
    return getNullType();
  } else if (mddocAssertion.isFieldUndefined(item)) {
    return getUndefinedType();
  } else if (mddocAssertion.isFieldDate(item)) {
    return getDateType();
  } else if (mddocAssertion.isFieldArray(item)) {
    return getArrayType(doc, mddocConstruct.constructFieldArray(item));
  } else if (mddocAssertion.isFieldOrCombination(item)) {
    return getOrCombinationType(
      doc,
      mddocConstruct.constructFieldOrCombination(item)
    );
  } else if (mddocAssertion.isFieldBinary(item)) {
    return getBinaryType(doc, asFetchResponseIfFieldBinary);
  } else if (mddocAssertion.isFieldObject(item)) {
    return generateObjectDefinition(
      doc,
      mddocConstruct.constructFieldObject(item),
      asFetchResponseIfFieldBinary
    );
  } else {
    return 'unknown';
  }
}

function shouldEncloseObjectKeyInQuotes(key: string) {
  return /[0-9]/.test(key[0]) || /[^A-Za-z0-9]/.test(key);
}

function generateObjectDefinition(
  doc: Doc,
  item: MddocFieldObject<AnyObject>,
  asFetchResponse: boolean,
  name?: string,
  extraFields: string[] = []
) {
  name = name ?? item.assertGetName();
  if (doc.generatedTypeCache.has(name)) {
    return name;
  }

  const fields = item.getFields() ?? {};
  const entries: string[] = [];
  for (let key in fields) {
    const value = fields[key];
    const entryType = getType(doc, value.data, asFetchResponse);
    const separator = value.required ? ':' : '?:';
    key = shouldEncloseObjectKeyInQuotes(key) ? `"${key}"` : key;
    const entry = `${key}${separator} ${entryType};`;
    entries.push(entry);

    const valueData = value.data;
    if (mddocAssertion.isFieldObject(valueData)) {
      generateObjectDefinition(
        doc,
        mddocConstruct.constructFieldObject(valueData),
        asFetchResponse
      );
    } else if (
      mddocAssertion.isFieldArray(valueData) &&
      mddocAssertion.isFieldObject(
        mddocConstruct.constructFieldArray(valueData).assertGetType()
      )
    ) {
      generateObjectDefinition(
        doc,
        mddocConstruct
          .constructFieldArray(valueData)
          .assertGetType() as MddocFieldObject<AnyObject>,
        asFetchResponse
      );
    }
  }

  doc.appendType(`export type ${name} = {`);
  entries.concat(extraFields).forEach(entry => doc.appendType(entry));
  doc.appendType('}');
  doc.generatedTypeCache.set(name, true);
  return name;
}

function getTypesFromEndpoint(endpoint: MddocHttpEndpointDefinition) {
  // Request body
  const sdkRequestBodyRaw =
    endpoint.getSdkParamsBody() ?? endpoint.getRequestBody();
  const sdkRequestObject = mddocAssertion.isFieldObject(sdkRequestBodyRaw)
    ? sdkRequestBodyRaw
    : mddocAssertion.isMultipartFormdata(sdkRequestBodyRaw)
    ? mddocConstruct
        .constructHttpEndpointMultipartFormdata(sdkRequestBodyRaw)
        .assertGetItems()
    : mddocAssertion.isSdkParamsBody(sdkRequestBodyRaw)
    ? mddocConstruct.constructSdkParamsBody(sdkRequestBodyRaw).assertGetDef()
    : undefined;

  // Success response body
  const successResponseBodyRaw = endpoint.getResponseBody();
  const successResponseBodyObject = mddocAssertion.isFieldObject(
    successResponseBodyRaw
  )
    ? successResponseBodyRaw
    : undefined;

  // Success response headers
  const successResponseHeadersObject = endpoint.getResponseHeaders();

  type SdkEndpointResponseType = {
    body?: any;
  };

  const successObjectFields: SdkEndpointResponseType = {};
  const requestBodyObjectHasRequiredFields =
    sdkRequestObject &&
    mddocAssertion.fieldObjectHasRequiredFields(sdkRequestObject);

  if (successResponseBodyObject) {
    if (
      mddocAssertion.fieldObjectHasRequiredFields(successResponseBodyObject)
    ) {
      successObjectFields.body = mddocConstruct.constructFieldObjectField({
        required: true,
        data: successResponseBodyObject,
      });
    } else {
      successObjectFields.body = mddocConstruct.constructFieldObjectField({
        required: false,
        data: successResponseBodyObject,
      });
    }
  } else if (mddocAssertion.isFieldBinary(successResponseBodyRaw)) {
    successObjectFields.body = mddocConstruct.constructFieldObjectField({
      required: true,
      data: successResponseBodyRaw,
    });
  }

  return {
    requestBodyObjectHasRequiredFields,
    sdkRequestBodyRaw,
    sdkRequestObject,
    mddocSdkRequestObject: sdkRequestObject
      ? mddocConstruct.constructFieldObject(sdkRequestObject)
      : undefined,
    successResponseBodyRaw,
    mddocSuccessResponseBodyRaw: successResponseBodyRaw
      ? mddocConstruct.constructFieldObject(successResponseBodyRaw)
      : undefined,
    successResponseBodyObject,
    mddocSuccessResponseBodyObject: successResponseBodyObject
      ? mddocConstruct.constructFieldObject(successResponseBodyObject)
      : undefined,
    successResponseHeadersObject,
    mddocSuccessResponseHeadersObject: successResponseHeadersObject
      ? mddocConstruct.constructFieldObject(successResponseHeadersObject)
      : undefined,
  };
}

function generateTypesFromEndpoint(
  doc: Doc,
  endpoint: MddocHttpEndpointDefinition
) {
  const {mddocSuccessResponseBodyObject, mddocSdkRequestObject} =
    getTypesFromEndpoint(endpoint);

  // Request body
  if (mddocSdkRequestObject) {
    generateObjectDefinition(doc, mddocSdkRequestObject, false);
  }

  // Success response body
  if (mddocSuccessResponseBodyObject) {
    generateObjectDefinition(
      doc,
      mddocSuccessResponseBodyObject,
      /** asFetchResponse */ true
    );
  }
}

function documentTypesFromEndpoint(
  doc: Doc,
  endpoint: MddocHttpEndpointDefinition
) {
  generateTypesFromEndpoint(doc, endpoint);
}

function decideIsBinaryRequest(
  req: ReturnType<typeof getTypesFromEndpoint>['sdkRequestBodyRaw']
) {
  return (
    mddocAssertion.isMultipartFormdata(req) ||
    (mddocAssertion.isSdkParamsBody(req) && req.serializeAs === 'formdata')
  );
}

function generateEndpointCode(
  doc: Doc,
  types: ReturnType<typeof getTypesFromEndpoint>,
  className: string,
  fnName: string,
  endpoint: MddocHttpEndpointDefinition
) {
  const {
    mddocSdkRequestObject,
    mddocSuccessResponseBodyRaw,
    mddocSuccessResponseBodyObject,
    requestBodyObjectHasRequiredFields,
    sdkRequestBodyRaw,
  } = types;

  doc.appendImportFromGenTypes(
    compact([
      mddocSdkRequestObject?.assertGetName(),
      mddocSuccessResponseBodyObject?.assertGetName(),
    ])
  );

  let endpointParamsText = '';
  let resultTypeName = 'undefined';
  const isBinaryRequest = decideIsBinaryRequest(sdkRequestBodyRaw);
  const isBinaryResponse = mddocAssertion.isFieldBinary(
    mddocSuccessResponseBodyRaw
  );
  const requestBodyObjectName = mddocSdkRequestObject?.assertGetName();

  if (mddocSuccessResponseBodyObject) {
    doc.appendImportFromGenTypes([
      mddocSuccessResponseBodyObject.assertGetName(),
    ]);
    resultTypeName = mddocSuccessResponseBodyObject.assertGetName();
  } else if (isBinaryResponse) {
    resultTypeName = getBinaryType(doc, /** asFetchResponse */ true);
  }

  if (mddocSdkRequestObject) {
    if (isBinaryResponse) {
      if (requestBodyObjectHasRequiredFields) {
        endpointParamsText = `props: FimidaraEndpointWithBinaryResponseParamsRequired<${requestBodyObjectName}>`;
      } else {
        endpointParamsText = `props: FimidaraEndpointWithBinaryResponseParamsOptional<${requestBodyObjectName}>`;
      }
    } else {
      if (requestBodyObjectHasRequiredFields) {
        endpointParamsText = `props: FimidaraEndpointParamsRequired<${requestBodyObjectName}>`;
      } else {
        endpointParamsText = `props?: FimidaraEndpointParamsOptional<${requestBodyObjectName}>`;
      }
    }
  } else {
    endpointParamsText = 'props?: FimidaraEndpointParamsOptional<undefined>';
  }

  const bodyText: string[] = [];
  let mapping = '';
  const sdkBody = endpoint.getSdkParamsBody();

  if (isBinaryResponse) {
    bodyText.push('responseType: props.responseType,');
  }

  if (isBinaryRequest) {
    bodyText.push('formdata: props.body,');
  } else if (mddocSdkRequestObject) {
    bodyText.push('data: props?.body,');
  }

  if (mddocSdkRequestObject && sdkBody) {
    forEach(mddocSdkRequestObject.fields ?? {}, (value, key) => {
      const mapTo = sdkBody.mappings(key);

      if (mapTo) {
        const entry = `"${key}": ["${mapTo[0]}", "${String(mapTo[1])}"],`;
        mapping += entry;
      }
    });

    if (mapping.length) {
      mapping = `{${mapping}}`;
    }
  }

  const text = `${fnName} = async (${endpointParamsText}): Promise<FimidaraEndpointResult<${resultTypeName}>> => {
    ${mapping.length ? `const mapping = ${mapping} as const` : ''}
    return this.execute${isBinaryResponse ? 'Raw' : 'Json'}({
      ...props,
      ${bodyText.join('')}
      path: "${endpoint.assertGetBasePathname()}",
      method: "${endpoint.assertGetMethod().toUpperCase()}",
    }, props, ${mapping.length ? 'mapping' : ''});
  }`;

  doc.appendToClass(text, className, 'FimidaraEndpointsBase');
}

function generateEveryEndpointCode(
  doc: Doc,
  endpoints: Array<MddocHttpEndpointDefinition>
) {
  const leafEndpointsMap: Record<
    string,
    Record<
      string,
      {
        endpoint: MddocHttpEndpointDefinition;
        types: ReturnType<typeof getTypesFromEndpoint>;
      }
    >
  > = {};
  const branchMap: Record<
    string,
    Record<string, Record<string, /** Record<string, any...> */ any>>
  > = {};

  endpoints.forEach(e1 => {
    const pathname = e1.assertGetBasePathname();
    // pathname looks like /v1/agentToken/addAgentToken, which should yield 4
    // parts, but pathSplit, removes empty strings, so we'll have ["v1",
    // "agentToken", "addAgentToken"]. also filter out path params.
    const [, ...rest] = pathSplit({input: pathname}).filter(
      p => !p.startsWith(':')
    );

    assert(rest.length >= 2);
    const fnName = last(rest);
    const groupName = nth(rest, rest.length - 2);
    const className = `${upperFirst(groupName)}Endpoints`;
    const types = getTypesFromEndpoint(e1);
    const key = `${className}.${fnName}`;
    set(leafEndpointsMap, key, {types, endpoint: e1});

    const branches = rest.slice(0, -1);
    const branchesKey = branches.join('.');
    set(branchMap, branchesKey, {});
  });

  doc.appendImport(
    [
      'invokeEndpoint',
      'SoftkaveMddocEndpointsBase',
      'SoftkaveMddocEndpointResult',
      'SoftkaveMddocEndpointParamsRequired',
      'SoftkaveMddocEndpointParamsOptional',
      'SoftkaveMddocEndpointWithBinaryResponseParamsRequired',
      'SoftkaveMddocEndpointWithBinaryResponseParamsOptional',
    ],
    './mddoc/utils'
  );

  for (const groupName in leafEndpointsMap) {
    const group = leafEndpointsMap[groupName];

    for (const fnName in group) {
      const {types, endpoint} = group[fnName];
      generateEndpointCode(doc, types, groupName, fnName, endpoint);
    }
  }

  function docBranch(
    parentName: string,
    ownName: string,
    branch: Record<string, any>
  ) {
    if (!isObjectEmpty(branch)) {
      forEach(branch, (b1, bName) => {
        docBranch(ownName, bName, b1);
      });
    }

    doc.appendToClass(
      `${ownName} = new ${upperFirst(ownName)}Endpoints(this.config, this);`,
      `${upperFirst(parentName)}Endpoints`,
      'SoftkaveMddocEndpointsBase'
    );
  }

  for (const ownName in branchMap) {
    docBranch('fimidara', ownName, branchMap[ownName]);
  }
}

function uniqEnpoints(endpoints: Array<MddocHttpEndpointDefinition>) {
  const endpointNameMap: Record<string, string> = {};

  endpoints.forEach(e1 => {
    const names = pathSplit({input: e1.assertGetBasePathname()});
    const fnName = last(names);
    const method = e1.assertGetMethod().toLowerCase();
    const key = `${fnName}__${method}`;
    endpointNameMap[key] = key;
  });

  return endpoints.filter(e1 => {
    const names = pathSplit({input: e1.assertGetBasePathname()});
    const fnName = last(names);
    const method = e1.assertGetMethod().toLowerCase();
    const ownKey = `${fnName}__${method}`;
    const postKey = `${fnName}__post`;
    const getKey = `${fnName}__get`;

    if (ownKey === getKey && endpointNameMap[postKey]) {
      return false;
    }

    return true;
  });
}

export interface MddocJsSdkCodeGenParams {
  endpoints: AppExportedHttpEndpoints;
  filenamePrefix: string;
  dir: string;
}

async function endpointsCodeGen(params: MddocJsSdkCodeGenParams) {
  const {endpoints, filenamePrefix, dir} = params;
  const endpointsDir = path.normalize(dir + '/src');
  const typesFilename = `${filenamePrefix}Types`;
  const typesFilepath = path.normalize(
    endpointsDir + '/' + typesFilename + '.ts'
  );
  const codesFilepath = path.normalize(
    endpointsDir + `/${filenamePrefix}Endpoints.ts`
  );
  const typesDoc = new Doc('./' + typesFilename);
  const codesDoc = new Doc('./' + typesFilename);

  forEach(endpoints, e1 => {
    if (e1)
      documentTypesFromEndpoint(
        typesDoc,
        e1.mddocHttpDefinition as unknown as MddocHttpEndpointDefinition
      );
  });

  const httpEndpoints = endpoints.map(e1 => e1.mddocHttpDefinition);
  const uniqHttpEndpoints = uniqEnpoints(
    httpEndpoints as unknown as Array<MddocHttpEndpointDefinition>
  );
  generateEveryEndpointCode(codesDoc, uniqHttpEndpoints);

  fse.ensureFileSync(typesFilepath);
  fse.ensureFileSync(codesFilepath);
  await Promise.all([
    fse.writeFile(typesFilepath, typesDoc.compileText(), {encoding: 'utf-8'}),
    fse.writeFile(codesFilepath, codesDoc.compileText(), {encoding: 'utf-8'}),
  ]);

  execSync(`npx --yes prettier --write "${typesFilepath}"`, {stdio: 'inherit'});
  execSync(`npx --yes prettier --write "${codesFilepath}"`, {stdio: 'inherit'});
}

async function copyPackage(params: MddocJsSdkCodeGenParams) {
  const {dir} = params;
  const fromDir = './js-sdk-base';
  const overwriteFiles = ['/src/mddoc'];
  const copyOnMissingFiles = [
    '/src/index.ts',
    '/src/constants.ts',
    '/.editorconfig',
    '/.eslintignore',
    '/.eslintrc.json',
    '/.prettierrc.js',
    '/jest.config.js',
    '/package.json',
    '/README.md',
    '/tsconfig.json',
  ];

  async function copyList(filepathList: string[], overwrite: boolean) {
    await Promise.all(
      filepathList.map(filepath =>
        fse.copy(
          path.normalize(fromDir + filepath),
          path.normalize(dir + filepath),
          {overwrite}
        )
      )
    );
  }

  await Promise.all([
    copyList(overwriteFiles, true),
    copyList(copyOnMissingFiles, true),
  ]);
}

export async function mddocJsSdkCodeGen(params: MddocJsSdkCodeGenParams) {
  await copyPackage(params);
  await endpointsCodeGen(params);
}
