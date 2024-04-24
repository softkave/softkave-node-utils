import {SchemaDefinitionProperty} from 'mongoose';
import {Agent} from '../definitions/agent';
import {Resource} from '../definitions/resource';

// ensures all the fields defined in the type are added to the schema
// TODO: do deep check to make sure that internal schemas are checked too
// eslint-disable-next-line @typescript-eslint/ban-types
export function ensureMongoTypeFields<T extends object>(schema: {
  [path in keyof Required<T>]: SchemaDefinitionProperty<T[path]>;
}) {
  return schema;
}

export const agentSchema = ensureMongoTypeFields<Agent>({
  agentId: {type: String},
  agentType: {type: String},
  agentTokenId: {type: String},
});

export const resourceSchema = ensureMongoTypeFields<Resource>({
  resourceId: {type: String, unique: true, index: true},
  createdAt: {type: Number, default: () => Date.now()},
  lastUpdatedAt: {type: Number, default: () => Date.now()},
  createdBy: {type: agentSchema},
  lastUpdatedBy: {type: agentSchema},
  isDeleted: {type: Boolean, index: true},
  deletedBy: {type: agentSchema},
  deletedAt: {type: Number},
});
