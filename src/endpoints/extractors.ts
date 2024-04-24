import {
  ExtractFieldsFrom,
  getExtractFields,
  makeExtract,
  makeExtractIfPresent,
  makeListExtract,
} from 'softkave-js-utils';
import {PublicAgent} from '../definitions/agent';
import {PublicResource} from '../definitions/resource';

const agentPublicFields = getExtractFields<PublicAgent>({
  agentId: true,
  agentType: true,
});

export const agentExtractor = makeExtract(agentPublicFields);
export const agentExtractorIfPresent = makeExtractIfPresent(agentPublicFields);
export const agentListExtractor = makeListExtract(agentPublicFields);

export const resourceFields: ExtractFieldsFrom<PublicResource> = {
  resourceId: true,
  createdAt: true,
  lastUpdatedAt: true,
  deletedAt: true,
  isDeleted: true,
  deletedBy: agentExtractorIfPresent,
  createdBy: agentExtractorIfPresent,
  lastUpdatedBy: agentExtractorIfPresent,
};

export const resourceExtractor = makeExtract(
  getExtractFields<PublicResource>(resourceFields)
);
export const resourceListExtractor = makeListExtract(
  getExtractFields<PublicResource>(resourceFields)
);
