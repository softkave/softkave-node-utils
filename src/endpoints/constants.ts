export const kEndpointConstants = {
  maxNameLength: 150,
  maxDescriptionLength: 700,
  httpStatusCode: {
    ok: 200,
    badRequest: 400,
    unauthorized: 401,
    forbidden: 403,
    notFound: 404,
    conflict: 409,
    tooManyRequests: 429,
    serverError: 500,
  } as const,
  minPage: 0,
  minPageSize: 1,
  maxPageSize: 1000,
  providedResourceIdMaxLength: 50,
  inputListMax: 1000,
  apiv1: '/v1',
};