import {
  EventTypeMap,
  StateBuilder
} from './mutationState'
import {
  ConfigGetters,
  ConfigSetters
} from './config'

import { ExecutionResult } from 'graphql/execution'
import { DocumentNode } from 'graphql/language'
import { GraphQLFieldResolver } from 'graphql'

export interface MutationsModule<
  TState,
  TEventMap extends EventTypeMap
> {
  resolvers: MutationResolvers,
  config: ConfigSetters,
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

export type MutationExecutor = (query: MutationQuery, resolvers: MutationResolvers) => Promise<MutationResult>

export interface Mutations<TConfig extends ConfigSetters> {
  execute: (query: MutationQuery) => Promise<MutationResult>
  configure: (config: ConfigGetters<TConfig>) => void
}