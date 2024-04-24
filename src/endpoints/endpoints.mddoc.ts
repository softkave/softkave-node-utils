import {first} from 'lodash';
import {customAlphabet} from 'nanoid';
import {AnyObject, kSoftkaveJsUtilsConstants} from 'softkave-js-utils';
import {PublicAgent} from '../definitions/agent';
import {PublicResource} from '../definitions/resource';
import {
  kFimidaraResourceType,
  kResourceTypeShortNames,
} from '../definitions/resourceTypes';
import {FimidaraExternalError} from '../errors/OperationError';
import {FieldObjectFieldsMap, mddocConstruct} from '../mddoc/mddoc';
import {kEndpointConstants} from './constants';
import {LongRunningJobResult, MultipleLongRunningJobResult} from './jobs/types';
import {
  BaseEndpointResult,
  CountItemsEndpointResult,
  EndpointResultNote,
  HttpEndpointRequestHeaders_AuthOptional,
  HttpEndpointRequestHeaders_AuthOptional_ContentType,
  HttpEndpointRequestHeaders_AuthRequired,
  HttpEndpointRequestHeaders_AuthRequired_ContentType,
  HttpEndpointRequestHeaders_ContentType,
  HttpEndpointResponseHeaders_ContentType_ContentLength,
  ServerRecommendedActionsMap,
  kEndpointResultNoteCodeMap,
} from './types';

export const mddocEndpointStatusCodes = {
  success: `${kEndpointConstants.httpStatusCode.ok}`,
  error: '4XX or 5XX',
} as const;

const requestHeaderItem_JsonContentType = mddocConstruct
  .constructFieldString()
  .setDescription('HTTP JSON request content type')
  .setExample('application/json');
const requestHeaderItem_MultipartFormdataContentType = mddocConstruct
  .constructFieldString()
  .setDescription('HTTP multipart form-data request content type')
  .setExample('multipart/form-data')
  .setValid(['multipart/form-data']);
const responseHeaderItem_JsonContentType = mddocConstruct
  .constructFieldString()
  .setDescription('HTTP JSON response content type')
  .setExample('application/json');
const responseHeaderItem_ContentLength = mddocConstruct
  .constructFieldString()
  .setDescription('HTTP response content length in bytes');
const requestHeaderItem_Authorization = mddocConstruct
  .constructFieldString()
  .setDescription('Access token')
  .setExample('Bearer <token>');
const requestHeaderItem_ContentType = mddocConstruct
  .constructFieldString()
  .setDescription('HTTP request content type')
  .setExample('application/json or multipart/form-data');

const requestHeaders_AuthRequired_JsonContentType = mddocConstruct
  .constructFieldObject<HttpEndpointRequestHeaders_AuthRequired_ContentType>()
  .setFields({
    Authorization: mddocConstruct.constructFieldObjectField({
      required: true,
      data: requestHeaderItem_Authorization,
    }),
    'Content-Type': mddocConstruct.constructFieldObjectField({
      required: true,
      data: requestHeaderItem_JsonContentType,
    }),
  })
  .setName('HttpEndpointRequestHeaders_AuthRequired_JsonContentType');
const requestHeaders_AuthOptional_JsonContentType = mddocConstruct
  .constructFieldObject<HttpEndpointRequestHeaders_AuthOptional_ContentType>()
  .setFields({
    Authorization: mddocConstruct.constructFieldObjectField({
      required: false,
      data: requestHeaderItem_Authorization,
    }),
    'Content-Type': mddocConstruct.constructFieldObjectField({
      required: true,
      data: requestHeaderItem_JsonContentType,
    }),
  })
  .setName('HttpEndpointRequestHeaders_AuthOptional_JsonContentType');
const requestHeaders_JsonContentType = mddocConstruct
  .constructFieldObject<HttpEndpointRequestHeaders_ContentType>()
  .setFields({
    'Content-Type': mddocConstruct.constructFieldObjectField({
      required: true,
      data: requestHeaderItem_JsonContentType,
    }),
  })
  .setName('HttpEndpointRequestHeaders_JsonContentType');
const requestHeaders_AuthRequired_MultipartContentType = mddocConstruct
  .constructFieldObject<HttpEndpointRequestHeaders_AuthRequired_ContentType>()
  .setFields({
    Authorization: mddocConstruct.constructFieldObjectField({
      required: true,
      data: requestHeaderItem_Authorization,
    }),
    'Content-Type': mddocConstruct.constructFieldObjectField({
      required: true,
      data: requestHeaderItem_MultipartFormdataContentType,
    }),
  })
  .setName('HttpEndpointRequestHeaders_AuthRequired_MultipartContentType');
const requestHeaders_AuthOptional_MultipartContentType = mddocConstruct
  .constructFieldObject<HttpEndpointRequestHeaders_AuthOptional_ContentType>()
  .setFields({
    Authorization: mddocConstruct.constructFieldObjectField({
      required: false,
      data: requestHeaderItem_Authorization,
    }),
    'Content-Type': mddocConstruct.constructFieldObjectField({
      required: true,
      data: requestHeaderItem_MultipartFormdataContentType,
    }),
  })
  .setName('HttpEndpointRequestHeaders_AuthOptional_MultipartContentType');
const requestHeaders_MultipartContentType = mddocConstruct
  .constructFieldObject<HttpEndpointRequestHeaders_ContentType>()
  .setFields({
    'Content-Type': mddocConstruct.constructFieldObjectField({
      required: true,
      data: requestHeaderItem_MultipartFormdataContentType,
    }),
  })
  .setName('HttpEndpointRequestHeaders_MultipartContentType');
const requestHeaders_AuthRequired = mddocConstruct
  .constructFieldObject<HttpEndpointRequestHeaders_AuthRequired>()
  .setFields({
    Authorization: mddocConstruct.constructFieldObjectField({
      required: true,
      data: requestHeaderItem_Authorization,
    }),
  })
  .setName('HttpEndpointRequestHeaders_AuthRequired');
const requestHeaders_AuthOptional = mddocConstruct
  .constructFieldObject<HttpEndpointRequestHeaders_AuthOptional>()
  .setFields({
    Authorization: mddocConstruct.constructFieldObjectField({
      required: false,
      data: requestHeaderItem_Authorization,
    }),
  })
  .setName('HttpEndpointRequestHeaders_AuthOptional');
const responseHeaders_JsonContentType = mddocConstruct
  .constructFieldObject<HttpEndpointResponseHeaders_ContentType_ContentLength>()
  .setFields({
    'Content-Type': mddocConstruct.constructFieldObjectField({
      required: true,
      data: responseHeaderItem_JsonContentType,
    }),
    'Content-Length': mddocConstruct.constructFieldObjectField({
      required: true,
      data: responseHeaderItem_ContentLength,
    }),
  })
  .setName('HttpEndpointResponseHeaders_ContentType_ContentLength');

export const mddocEndpointHttpHeaderItems = {
  requestHeaderItem_Authorization,
  requestHeaderItem_ContentType,
  responseHeaderItem_JsonContentType,
  requestHeaderItem_JsonContentType,
  requestHeaderItem_MultipartFormdataContentType,
  requestHeaders_AuthRequired_JsonContentType,
  requestHeaders_AuthRequired,
  requestHeaders_JsonContentType,
  requestHeaders_AuthOptional,
  requestHeaders_MultipartContentType,
  requestHeaders_AuthOptional_MultipartContentType,
  requestHeaders_AuthRequired_MultipartContentType,
  requestHeaders_AuthOptional_JsonContentType,
  responseHeaderItem_ContentLength,
  responseHeaders_JsonContentType,
};

const nullValue = mddocConstruct.constructFieldNull();
const makeAgent = (agentTypeList: string[]) => {
  return mddocConstruct
    .constructFieldObject<PublicAgent>()
    .setName('Agent')
    .setFields({
      agentId: mddocConstruct.constructFieldObjectField({
        required: true,
        data: mddocConstruct
          .constructFieldString()
          .setDescription(
            'Agent ID. Possible agents are users and agent tokens'
          ),
      }),
      agentType: mddocConstruct.constructFieldObjectField({
        required: true,
        data: mddocConstruct
          .constructFieldString()
          .setDescription('Agent type')
          .setExample(first(agentTypeList))
          .setValid(agentTypeList)
          .setEnumName('AgentType'),
      }),
    });
};
const date = mddocConstruct
  .constructFieldNumber()
  .setDescription('UTC timestamp in milliseconds');
const dateOrNull = mddocConstruct
  .constructFieldOrCombination<number | null>()
  .setTypes([date, nullValue]);
const id = mddocConstruct
  .constructFieldString()
  .setDescription('Resource ID')
  .setExample(
    `${kResourceTypeShortNames[kFimidaraResourceType.Job]}${
      kSoftkaveJsUtilsConstants.resource.shortNameIdSeparator
    }${customAlphabet('0')()}`
  );
const idList = mddocConstruct
  .constructFieldArray<string>()
  .setType(id)
  .setDescription('List of resource IDs');
const idOrList = mddocConstruct
  .constructFieldOrCombination<string | string[]>()
  .setTypes([id, idList]);
const jobId = mddocConstruct
  .constructFieldString()
  .setDescription('Long running job ID')
  .setExample(
    `${kResourceTypeShortNames[kFimidaraResourceType.Job]}${
      kSoftkaveJsUtilsConstants.resource.shortNameIdSeparator
    }${customAlphabet('0')()}`
  );
const jobIds = mddocConstruct
  .constructFieldArray<string>()
  .setDescription('Multiple long running job IDs')
  .setType(jobId);
const name = mddocConstruct
  .constructFieldString()
  .setDescription('Name, case insensitive');
const description = mddocConstruct
  .constructFieldString()
  .setDescription('Description');
const expires = mddocConstruct
  .constructFieldNumber()
  .setDescription('Expiration date');
const duration = mddocConstruct
  .constructFieldNumber()
  .setDescription(
    'Time duration in milliseconds, for example, 1000 for 1 second'
  );
const tokenString = mddocConstruct
  .constructFieldString()
  .setDescription('JWT token string');
const providedResourceId = mddocConstruct
  .constructFieldString()
  .setDescription('Resource ID provided by you')
  .setMax(kEndpointConstants.providedResourceIdMaxLength);
const providedResourceIdOrNull = mddocConstruct
  .constructFieldOrCombination<string | null>()
  .setTypes([providedResourceId, nullValue]);
const firstName = mddocConstruct
  .constructFieldString()
  .setDescription('First name')
  .setExample('Jesus');
const lastName = mddocConstruct
  .constructFieldString()
  .setDescription('Last name')
  .setExample('Christ');
const password = mddocConstruct
  .constructFieldString()
  .setDescription('Password');
const emailAddress = mddocConstruct
  .constructFieldString()
  .setDescription('Email address, case insensitive')
  .setExample('my-email-address@email-domain.com');
const page = mddocConstruct
  .constructFieldNumber()
  .setDescription(
    'Paginated list page number. Page is zero-based, meaning page numbering starts from 0, 1, 2, 3, ..'
  )
  .setExample(0)
  .setMin(kEndpointConstants.minPage);
const pageSize = mddocConstruct
  .constructFieldNumber()
  .setDescription('Paginated list page size')
  .setExample(10)
  .setMin(kEndpointConstants.minPageSize)
  .setMax(kEndpointConstants.maxPageSize);
const resultNoteCode = mddocConstruct
  .constructFieldString()
  .setDescription('Endpoint result or error note code')
  .setExample(kEndpointResultNoteCodeMap.unknown)
  .setValid(Object.values(kEndpointResultNoteCodeMap))
  .setEnumName('EndpointResultNoteCode');
const resultNoteMessage = mddocConstruct
  .constructFieldString()
  .setDescription('Endpoint result or error note message')
  .setExample(
    "Some mounts in the requested folder's mount chain do not support operation abc"
  );
const resultNote = mddocConstruct
  .constructFieldObject<EndpointResultNote>()
  .setName('EndpointResultNote')
  .setFields({
    code: mddocConstruct.constructFieldObjectField({
      required: true,
      data: resultNoteCode,
    }),
    message: mddocConstruct.constructFieldObjectField({
      required: true,
      data: resultNoteMessage,
    }),
  });
const resultNoteList = mddocConstruct
  .constructFieldArray<EndpointResultNote>()
  .setType(resultNote);
const makeResourceParts = (
  agentTypeList: string[]
): FieldObjectFieldsMap<PublicResource> => {
  return {
    resourceId: mddocConstruct.constructFieldObjectField({
      required: true,
      data: id,
    }),
    createdBy: mddocConstruct.constructFieldObjectField({
      required: false,
      data: makeAgent(agentTypeList),
    }),
    createdAt: mddocConstruct.constructFieldObjectField({
      required: true,
      data: date,
    }),
    lastUpdatedBy: mddocConstruct.constructFieldObjectField({
      required: false,
      data: makeAgent(agentTypeList),
    }),
    lastUpdatedAt: mddocConstruct.constructFieldObjectField({
      required: true,
      data: date,
    }),
    isDeleted: mddocConstruct.constructFieldObjectField({
      required: true,
      data: mddocConstruct.constructFieldBoolean(),
    }),
    deletedAt: mddocConstruct.constructFieldObjectField({
      required: false,
      data: date,
    }),
    deletedBy: mddocConstruct.constructFieldObjectField({
      required: false,
      data: makeAgent(agentTypeList),
    }),
  };
};

export const fReusables = {
  makeAgent,
  date,
  id,
  idList,
  name,
  description,
  expires,
  duration,
  tokenString,
  providedResourceId,
  idOrList,
  firstName,
  lastName,
  emailAddress,
  page,
  pageSize,
  jobId,
  password,
  providedResourceIdOrNull,
  dateOrNull,
  nullValue,
  resultNote,
  resultNoteCode,
  resultNoteList,
  makeResourceParts,
  jobIds,
};

const errorObject = mddocConstruct
  .constructFieldObject<FimidaraExternalError>()
  .setName('OperationError')
  .setFields({
    name: mddocConstruct.constructFieldObjectField({
      required: true,
      data: mddocConstruct
        .constructFieldString()
        .setDescription('Error name')
        .setExample('ValidationError'),
    }),
    message: mddocConstruct.constructFieldObjectField({
      required: true,
      data: mddocConstruct
        .constructFieldString()
        .setDescription('Error message')
        .setExample('Workspace name is invalid'),
    }),
    action: mddocConstruct.constructFieldObjectField({
      required: false,
      data: mddocConstruct
        .constructFieldString()
        .setDescription('Recommended action')
        .setValid(Object.values(ServerRecommendedActionsMap)),
    }),
    field: mddocConstruct.constructFieldObjectField({
      required: false,
      data: mddocConstruct
        .constructFieldString()
        .setExample('workspace.innerField.secondInnerField')
        .setDescription(
          'Invalid field failing validation when error is ValidationError'
        ),
    }),
    notes: mddocConstruct.constructFieldObjectField({
      required: false,
      data: resultNoteList,
    }),
  });

const errorResponseBody = mddocConstruct
  .constructFieldObject<BaseEndpointResult>()
  .setName('EndpointErrorResult')
  .setFields({
    errors: mddocConstruct.constructFieldObjectField({
      required: false,
      data: mddocConstruct
        .constructFieldArray<FimidaraExternalError>()
        .setType(errorObject)
        .setDescription('Endpoint call response errors'),
    }),
  })
  .setDescription('Endpoint error result');

const emptySuccessResponseBody = mddocConstruct
  .constructFieldObject<AnyObject>()
  .setName('EmptyEndpointResult')
  .setFields({})
  .setDescription('Empty endpoint success result');

const longRunningJobResponseBody = mddocConstruct
  .constructFieldObject<LongRunningJobResult>()
  .setName('LongRunningJobResult')
  .setFields({
    jobId: mddocConstruct.constructFieldObjectField({
      required: false,
      data: jobId,
    }),
  })
  .setDescription('Long running job endpoint success result');

const multipleLongRunningJobResponseBody = mddocConstruct
  .constructFieldObject<MultipleLongRunningJobResult>()
  .setName('MultipleLongRunningJobResult')
  .setFields({
    jobIds: mddocConstruct.constructFieldObjectField({
      required: true,
      data: jobIds,
    }),
  })
  .setDescription('Long running job endpoint success result');

const countResponseBody = mddocConstruct
  .constructFieldObject<CountItemsEndpointResult>()
  .setName('CountItemsResult')
  .setFields({
    count: mddocConstruct.constructFieldObjectField({
      required: true,
      data: mddocConstruct
        .constructFieldNumber()
        .setDescription('Resource count'),
    }),
  })
  .setDescription('Count endpoint success result');

export const mddocEndpointHttpResponseItems = {
  errorResponseBody,
  emptySuccessResponseBody,
  longRunningJobResponseBody,
  countResponseBody,
  multipleLongRunningJobResponseBody,
};
