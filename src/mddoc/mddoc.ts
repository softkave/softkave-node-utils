import {construct} from 'js-accessor';
import {WithAccessors} from 'js-accessor/build/src/types';
import {
  AnyFn,
  AnyObject,
  IsBoolean,
  IsStringEnum,
  IsUnion,
  Not,
} from 'softkave-js-utils';
import {Readable} from 'stream';
import {IsNever, OptionalKeysOf} from 'type-fest';
import {
  BaseEndpointResult,
  HttpEndpointResponseHeaders_ContentType_ContentLength,
} from '../endpoints/types';

export interface FieldBaseType {
  __id: string;
  description?: string;
}

export interface FieldStringType {
  __id: 'FieldStringType';
  example?: string;
  valid?: string[];
  min?: number;
  max?: number;
  enumName?: string;
  description?: string;
}

export interface FieldNumberType {
  __id: 'FieldNumberType';
  example?: number;
  integer?: boolean;
  min?: number;
  max?: number;
  description?: string;
}

export interface FieldBooleanType {
  __id: 'FieldBooleanType';
  example?: boolean;
  description?: string;
}

export interface FieldNullType {
  __id: 'FieldNullType';
  description?: string;
}

export interface FieldUndefinedType {
  __id: 'FieldUndefinedType';
  description?: string;
}

export interface FieldDateType {
  __id: 'FieldDateType';
  example?: string;
  description?: string;
}

export interface FieldArrayType<T> {
  __id: 'FieldArrayType';
  type?: ConvertToMddocType<T>;
  min?: number;
  max?: number;
  description?: string;
}

export interface FieldObjectFieldType<T, TRequired extends boolean = any> {
  __id: 'FieldObjectFieldType';
  required: TRequired;
  data: ConvertToMddocType<T>;
  description?: string;
}

export type ConvertToMddocType<
  T = any,
  TAllowOrCombination extends boolean = true,
> = IsNever<
  IsUnion<Exclude<T, undefined>> &
    TAllowOrCombination &
    Not<IsStringEnum<Exclude<T, undefined>>> &
    Not<IsBoolean<Exclude<T, undefined>>>
> extends false
  ? FieldOrCombinationType<Array<ConvertToMddocType<T, false>>>
  : T extends string
  ? FieldStringType
  : T extends number
  ? FieldNumberType
  : T extends boolean
  ? FieldBooleanType
  : T extends Array<infer InferedType>
  ? FieldArrayType<InferedType>
  : T extends Buffer
  ? FieldBinaryType
  : T extends Readable
  ? FieldBinaryType
  : T extends null
  ? FieldNullType
  : T extends AnyObject
  ? FieldObjectType<Exclude<T, undefined>>
  : FieldBaseType;

export type FieldObjectFieldsMap<T extends AnyObject> = Required<{
  [K in keyof T]: K extends OptionalKeysOf<T>
    ? FieldObjectFieldType<Exclude<T[K], undefined>, false>
    : FieldObjectFieldType<Exclude<T[K], undefined>, true>;
}>;

export interface FieldObjectType<T extends AnyObject> {
  __id: 'FieldObjectType';
  name?: string;
  fields?: FieldObjectFieldsMap<T>;
  description?: string;
}

export interface FieldOrCombinationType<
  T extends FieldBaseType[] = FieldBaseType[],
> {
  __id: 'FieldOrCombinationType';
  types?: T;
  description?: string;
}

export interface FieldBinaryType {
  __id: 'FieldBinaryType';
  min?: number;
  max?: number;
  description?: string;
}

export type MappingFn<
  TSdkParams,
  TRequestHeaders,
  TPathParameters,
  TQuery,
  TRequestBody,
> = AnyFn<
  [keyof TSdkParams],
  | ['header', keyof TRequestHeaders]
  | ['path', keyof TPathParameters]
  | ['query', keyof TQuery]
  | ['body', keyof TRequestBody]
  | undefined
>;

export type SdkParamsToRequestArtifactsMapping<
  TSdkParams,
  TRequestHeaders,
  TPathParameters,
  TQuery,
  TRequestBody,
> = AnyFn<
  [keyof TSdkParams],
  Array<
    | ['header', keyof TRequestHeaders]
    | ['path', keyof TPathParameters]
    | ['query', keyof TQuery]
    | ['body', keyof TRequestBody]
  >
>;

export interface SdkParamsBodyType<
  T extends AnyObject = AnyObject,
  TRequestHeaders extends AnyObject = AnyObject,
  TPathParameters extends AnyObject = AnyObject,
  TQuery extends AnyObject = AnyObject,
  TRequestBody extends AnyObject = AnyObject,
> {
  __id: 'SdkParamsBodyType';
  def?: FieldObjectType<T>;
  mappings: MappingFn<
    T,
    TRequestHeaders,
    TPathParameters,
    TQuery,
    TRequestBody
  >;
  serializeAs?: 'json' | 'formdata';
}

export interface HttpEndpointMultipartFormdataType<T extends AnyObject> {
  __id: 'HttpEndpointMultipartFormdataType';
  items?: FieldObjectType<T>;
  description?: string;
}

export enum HttpEndpointDefinitionMethod {
  Get = 'get',
  Post = 'post',
  Delete = 'delete',
}

export interface HttpEndpointDefinitionType<
  TRequestHeaders extends AnyObject = AnyObject,
  TPathParameters extends AnyObject = AnyObject,
  TQuery extends AnyObject = AnyObject,
  TRequestBody extends AnyObject = AnyObject,
  TResponseHeaders extends AnyObject = AnyObject,
  TResponseBody extends AnyObject = AnyObject,
  TSdkParams extends AnyObject = TRequestBody,
> {
  __id: 'HttpEndpointDefinitionType';
  basePathname?: string;
  method?: HttpEndpointDefinitionMethod;
  pathParamaters?: FieldObjectType<TPathParameters>;
  query?: FieldObjectType<TQuery>;
  requestHeaders?: FieldObjectType<TRequestHeaders>;
  requestBody?:
    | FieldObjectType<TRequestBody>
    | HttpEndpointMultipartFormdataType<TRequestBody>;
  responseHeaders?: FieldObjectType<TResponseHeaders>;
  responseBody?: TResponseBody extends FieldBinaryType
    ? FieldBinaryType
    : FieldObjectType<TResponseBody>;
  sdkParamsBody?: SdkParamsBodyType<
    TSdkParams,
    TRequestHeaders,
    TPathParameters,
    TQuery,
    TRequestBody
  >;
  name?: string;
  description?: string;

  // No need to manually set these fields, they are automatically added when
  // generating api and sdk since our error response header and body is the
  // same for all endpoints
  errorResponseHeaders?: FieldObjectType<HttpEndpointResponseHeaders_ContentType_ContentLength>;
  errorResponseBody?: FieldObjectType<BaseEndpointResult>;
}

export type InferFieldObjectType<
  T,
  TDefault = never,
> = T extends FieldObjectType<infer TObjectType> ? TObjectType : TDefault;

export type InferFieldObjectOrMultipartType<T> = T extends FieldObjectType<
  infer TObjectType
>
  ? TObjectType
  : T extends HttpEndpointMultipartFormdataType<infer TMultipartObjectType>
  ? TMultipartObjectType
  : never;

export type InferSdkParamsType<T> = T extends SdkParamsBodyType<
  infer TObjectType
>
  ? TObjectType
  : never;

export type MddocFieldArray<T> = WithAccessors<FieldArrayType<T>>;
export type MddocFieldBase = WithAccessors<FieldBaseType>;
export type MddocFieldBinary = WithAccessors<FieldBinaryType>;
export type MddocFieldBoolean = WithAccessors<FieldBooleanType>;
export type MddocFieldDate = WithAccessors<FieldDateType>;
export type MddocFieldNull = WithAccessors<FieldNullType>;
export type MddocFieldNumber = WithAccessors<FieldNumberType>;
export type MddocFieldObject<T extends AnyObject> = WithAccessors<
  FieldObjectType<T>
>;
export type MddocFieldObjectField<
  T,
  TRequired extends boolean = any,
> = WithAccessors<FieldObjectFieldType<T, TRequired>>;
export type MddocFieldOrCombination = WithAccessors<FieldOrCombinationType>;
export type MddocFieldString = WithAccessors<FieldStringType>;
export type MddocFieldUndefined = WithAccessors<FieldUndefinedType>;
export type MddocHttpEndpointDefinition<
  TRequestHeaders extends AnyObject = AnyObject,
  TPathParameters extends AnyObject = AnyObject,
  TQuery extends AnyObject = AnyObject,
  TRequestBody extends AnyObject = AnyObject,
  TResponseHeaders extends AnyObject = AnyObject,
  TResponseBody extends AnyObject = AnyObject,
  TSdkParams extends AnyObject = TRequestBody,
> = WithAccessors<
  HttpEndpointDefinitionType<
    TRequestHeaders,
    TPathParameters,
    TQuery,
    TRequestBody,
    TResponseHeaders,
    TResponseBody,
    TSdkParams
  >
>;
export type MddocHttpEndpointMultipartFormdata<T extends AnyObject> =
  WithAccessors<HttpEndpointMultipartFormdataType<T>>;
export type MddocSdkParamsBody = WithAccessors<SdkParamsBodyType>;

function constructFieldBase(seed: Partial<FieldBaseType> = {}) {
  return construct<FieldBaseType>(seed);
}

function constructFieldString(seed: Partial<FieldStringType> = {}) {
  return construct<FieldStringType>(seed);
}

function constructFieldNumber(seed: Partial<FieldNumberType> = {}) {
  return construct<FieldNumberType>(seed);
}

function constructFieldBoolean(seed: Partial<FieldBooleanType> = {}) {
  return construct<FieldBooleanType>(seed);
}

function constructFieldNull(seed: Partial<FieldNullType> = {}) {
  return construct<FieldNullType>(seed);
}

function constructFieldUndefined(seed: Partial<FieldUndefinedType> = {}) {
  return construct<FieldUndefinedType>(seed);
}

function constructFieldDate(seed: Partial<FieldDateType> = {}) {
  return construct<FieldDateType>(seed);
}

function constructFieldArray<T>(seed: Partial<FieldArrayType<T>> = {}) {
  return construct<FieldArrayType<T>>(seed);
}

function constructFieldObjectField<T, TRequired extends boolean = false>(
  seed: Partial<FieldObjectFieldType<T, TRequired>> & {
    required: TRequired;
    data: ConvertToMddocType<T>;
  }
) {
  return construct<FieldObjectFieldType<T, TRequired>>(seed);
}

function constructFieldObject<T extends AnyObject>(
  seed: Partial<FieldObjectType<T>> = {}
) {
  return construct<FieldObjectType<T>>(seed);
}

function constructSdkParamsBody<
  T extends AnyObject = AnyObject,
  TRequestHeaders extends AnyObject = AnyObject,
  TPathParameters extends AnyObject = AnyObject,
  TQuery extends AnyObject = AnyObject,
  TRequestBody extends AnyObject = AnyObject,
  TComplete = SdkParamsBodyType<
    T,
    TRequestHeaders,
    TPathParameters,
    TQuery,
    TRequestBody
  >,
>(
  seed: Partial<Omit<TComplete, 'mappings'>> & {
    mappings: MappingFn<
      T,
      TRequestHeaders,
      TPathParameters,
      TQuery,
      TRequestBody
    >;
  }
) {
  return construct<
    SdkParamsBodyType<T, TRequestHeaders, TPathParameters, TQuery, TRequestBody>
  >(seed);
}

function constructFieldOrCombination<T>(
  seed: Partial<
    FieldOrCombinationType<Array<ConvertToMddocType<T, false>>>
  > = {}
) {
  return construct<FieldOrCombinationType<Array<ConvertToMddocType<T, false>>>>(
    seed
  );
}

function constructFieldBinary(seed: Partial<FieldBinaryType> = {}) {
  return construct<FieldBinaryType>(seed);
}

function constructHttpEndpointMultipartFormdata<T extends AnyObject>(
  seed: Partial<HttpEndpointMultipartFormdataType<T>> = {}
) {
  return construct<HttpEndpointMultipartFormdataType<T>>(seed);
}

function constructHttpEndpointDefinition<
  TRequestHeaders extends AnyObject = AnyObject,
  TPathParameters extends AnyObject = AnyObject,
  TQuery extends AnyObject = AnyObject,
  TRequestBody extends AnyObject = AnyObject,
  TResponseHeaders extends AnyObject = AnyObject,
  TResponseBody extends AnyObject = AnyObject,
  TSdkParams extends AnyObject = TRequestBody,
>(
  seed: Partial<
    HttpEndpointDefinitionType<
      TRequestHeaders,
      TPathParameters,
      TQuery,
      TRequestBody,
      TResponseHeaders,
      TResponseBody,
      TSdkParams
    >
  > = {}
) {
  return construct<
    HttpEndpointDefinitionType<
      TRequestHeaders,
      TPathParameters,
      TQuery,
      TRequestBody,
      TResponseHeaders,
      TResponseBody,
      TSdkParams
    >
  >(seed);
}

export const mddocConstruct = {
  constructFieldArray,
  constructFieldBase,
  constructFieldBinary,
  constructFieldBoolean,
  constructFieldDate,
  constructFieldNull,
  constructFieldNumber,
  constructFieldObject,
  constructFieldObjectField,
  constructFieldOrCombination,
  constructFieldString,
  constructFieldUndefined,
  constructHttpEndpointDefinition,
  constructHttpEndpointMultipartFormdata,
  constructSdkParamsBody,
};

function fieldObjectHasRequiredFields(item: FieldObjectType<AnyObject>) {
  const mddocItem = constructFieldObject(item);
  return mddocItem.getFields()
    ? Object.values(mddocItem.assertGetFields()).findIndex(
        next => next.required
      ) !== -1
    : false;
}

function isFieldBase(data: unknown): data is FieldBaseType {
  return !!data && typeof (data as FieldBaseType).__id === 'string';
}

function isFieldString(data: unknown): data is FieldStringType {
  return !!data && (data as FieldStringType).__id === 'FieldStringType';
}

function isFieldNumber(data: unknown): data is FieldNumberType {
  return !!data && (data as FieldNumberType).__id === 'FieldNumberType';
}

function isFieldBoolean(data: unknown): data is FieldBooleanType {
  return !!data && (data as FieldBooleanType).__id === 'FieldBooleanType';
}

function isFieldNull(data: unknown): data is FieldNullType {
  return !!data && (data as FieldNullType).__id === 'FieldNullType';
}

function isFieldUndefined(data: unknown): data is FieldUndefinedType {
  return !!data && (data as FieldUndefinedType).__id === 'FieldUndefinedType';
}

function isFieldDate(data: unknown): data is FieldDateType {
  return !!data && (data as FieldDateType).__id === 'FieldDateType';
}

function isFieldArray(data: unknown): data is FieldArrayType<unknown> {
  return !!data && (data as FieldArrayType<unknown>).__id === 'FieldArrayType';
}

function isFieldObject(data: unknown): data is FieldObjectType<AnyObject> {
  return (
    !!data && (data as FieldObjectType<AnyObject>).__id === 'FieldObjectType'
  );
}

function isFieldOrCombination(data: unknown): data is FieldOrCombinationType {
  return (
    !!data && (data as FieldOrCombinationType).__id === 'FieldOrCombinationType'
  );
}

function isFieldBinary(data: unknown): data is FieldBinaryType {
  return !!data && (data as FieldBinaryType).__id === 'FieldBinaryType';
}

function isMultipartFormdata(
  data: unknown
): data is HttpEndpointMultipartFormdataType<AnyObject> {
  return (
    !!data &&
    (data as HttpEndpointMultipartFormdataType<AnyObject>).__id ===
      'HttpEndpointMultipartFormdataType'
  );
}

function isHttpEndpoint(data: unknown): data is HttpEndpointDefinitionType {
  return (
    !!data &&
    (data as HttpEndpointDefinitionType<AnyObject>).__id ===
      'HttpEndpointDefinitionType'
  );
}

function isSdkParamsBody(data: unknown): data is SdkParamsBodyType {
  return !!data && (data as SdkParamsBodyType).__id === 'SdkParamsBodyType';
}

export const mddocAssertion = {
  fieldObjectHasRequiredFields,
  isFieldBase,
  isFieldString,
  isFieldNumber,
  isFieldBoolean,
  isFieldNull,
  isFieldUndefined,
  isFieldDate,
  isFieldArray,
  isFieldObject,
  isFieldOrCombination,
  isFieldBinary,
  isMultipartFormdata,
  isHttpEndpoint,
  isSdkParamsBody,
};
