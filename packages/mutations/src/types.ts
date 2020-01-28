import {
  EventTypeMap,
  StateBuilder
} from './mutationState'
import {
  ConfigGenerators,
  ConfigArguments
} from './config'

import { ExecutionResult } from 'graphql/execution'
import { DocumentNode } from 'graphql/language'
import { GraphQLFieldResolver } from 'graphql'

export interface MutationsModule<
  TConfig extends ConfigGenerators,
  TState,
  TEventMap extends EventTypeMap
> {
  resolvers: MutationResolvers,
  config: TConfig,
  stateBuilder?: StateBuilder<TState, TEventMap>
}

export interface MutationResolvers {
  Mutation: {
      [field: string]: GraphQLFieldResolver<any, any>;
  };
}

export interface MutationQuery {
  query: DocumentNode
  variables: Record<string, any>
  operationName: string
  extensions?: Record<string, any>
  setContext: (context: Record<string, any>) => Record<string, any>
  getContext: () => Record<string, any>
}

export type MutationResult = ExecutionResult

export interface Mutations<TConfig extends ConfigGenerators> {
  execute: (query: MutationQuery) => Promise<MutationResult>
  configure: (config: ConfigArguments<TConfig>) => void
}
