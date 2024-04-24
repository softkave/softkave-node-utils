import {AnyFn} from 'softkave-js-utils';
import {Agent} from '../../definitions/agent';
import {Resource} from '../../definitions/resource';
import {
  DataProviderOpParams,
  DataProviderQueryListParams,
  DataProviderQueryParams,
  DataQuery,
} from '../data/types';

export interface SemanticProviderTxnOptions {
  txn?: unknown;
}

export interface SemanticProviderMutationTxnOptions {
  txn: unknown;
}

export interface SemanticProviderOpOptions
  extends SemanticProviderTxnOptions,
    DataProviderOpParams {
  includeDeleted?: boolean;
  isDeleted?: boolean;
}

export interface SemanticProviderMutationOpOptions
  extends Omit<SemanticProviderOpOptions, 'txn'>,
    SemanticProviderMutationTxnOptions {}

export interface SemanticProviderQueryRunOptions<
  TResource extends Partial<Resource>,
> extends SemanticProviderOpOptions,
    DataProviderQueryParams<TResource> {}

export interface SemanticProviderQueryListRunOptions<TResource extends Resource>
  extends SemanticProviderOpOptions,
    DataProviderQueryListParams<TResource> {}

export interface SemanticBaseProviderType<TResource extends Resource> {
  insertItem(
    item: TResource | TResource[],
    opts: SemanticProviderMutationTxnOptions
  ): Promise<void>;
  getOneById(
    id: string,
    opts?: SemanticProviderQueryRunOptions<TResource>
  ): Promise<TResource | null>;
  getManyByIdList(
    idList: string[],
    options?: SemanticProviderQueryListRunOptions<TResource>
  ): Promise<TResource[]>;
  countManyByIdList(
    idList: string[],
    opts?: SemanticProviderOpOptions
  ): Promise<number>;
  existsById(id: string, opts?: SemanticProviderOpOptions): Promise<boolean>;
  updateOneById(
    id: string,
    update: Partial<TResource>,
    opts: SemanticProviderMutationOpOptions
  ): Promise<void>;
  updateManyByQuery(
    query: DataQuery<TResource>,
    update: Partial<TResource>,
    opts: SemanticProviderMutationOpOptions
  ): Promise<void>;
  getAndUpdateOneById(
    id: string,
    update: Partial<TResource>,
    opts: SemanticProviderMutationOpOptions &
      SemanticProviderQueryRunOptions<TResource>
  ): Promise<TResource | null>;
  deleteOneById(
    id: string,
    opts: SemanticProviderMutationTxnOptions
  ): Promise<void>;
  deleteManyByIdList(
    idList: string[],
    opts: SemanticProviderMutationTxnOptions
  ): Promise<void>;
  softDeleteManyByIdList(
    idList: string[],
    agent: Agent,
    opts: SemanticProviderMutationTxnOptions
  ): Promise<void>;
  getOneByQuery(
    query: DataQuery<TResource>,
    opts?: SemanticProviderQueryRunOptions<TResource>
  ): Promise<TResource | null>;
  getManyByQuery(
    query: DataQuery<TResource>,
    options?: SemanticProviderQueryListRunOptions<TResource>
  ): Promise<TResource[]>;
  countByQuery(
    query: DataQuery<TResource>,
    opts?: SemanticProviderOpOptions
  ): Promise<number>;
  assertGetOneByQuery(
    query: DataQuery<TResource>,
    opts?: SemanticProviderQueryRunOptions<TResource>
  ): Promise<TResource>;
  existsByQuery(
    query: DataQuery<TResource>,
    opts?: SemanticProviderOpOptions
  ): Promise<boolean>;
  deleteManyByQuery(
    query: DataQuery<TResource>,
    opts: SemanticProviderMutationTxnOptions
  ): Promise<void>;
}

export type SemanticWorkspaceResourceProviderBaseType = Resource & {
  name?: string;
};

export interface SemanticProviderUtils {
  useTxnId(txn: unknown): string | undefined;
  withTxn<TResult>(
    fn: AnyFn<[SemanticProviderMutationTxnOptions], Promise<TResult>>,
    /** Whether or not to reuse an existing txn from async local storage. */
    reuseAsyncLocalTxn: boolean,
    opts?: SemanticProviderMutationTxnOptions
  ): Promise<TResult>;
}
