import {
  CoreEvents,
  CoreState,
  EventTypeMap,
  MutationState,
  MutationStatesSub,
  MutationStateSubs,
  StateBuilder,
  StateUpdater
} from './mutationState'
import { DataSources } from './dataSources'
import {
  ConfigGenerators,
  ConfigArguments,
  ConfigProperties
} from './config'

import { ExecutionResult } from 'graphql/execution'
import { DocumentNode } from 'graphql/language'
import { GraphQLFieldResolver } from 'graphql'

export interface MutationsModule<
  TConfig extends ConfigGenerators,
  TState = MutationState<CoreState>,
  TEventMap extends EventTypeMap = CoreEvents
> {
  resolvers: MutationResolvers<TConfig, TState, TEventMap>
  config: TConfig
  stateBuilder?: StateBuilder<TState, TEventMap>
}

export interface MutationContext<
  TConfig extends ConfigGenerators,
  TState = MutationState<CoreState>,
  TEventMap extends EventTypeMap = CoreEvents
> {
  [prop: string]: any,
  graph: {
    config: ConfigProperties<TConfig>
    dataSources: DataSources
    state: StateUpdater<TState, TEventMap>
    _mutationsCalled: string[]
    _rootSub?: MutationStatesSub<TState, TEventMap>
    _mutationSubs: MutationStateSubs<TState, TEventMap>
  }
}

export interface MutationResolvers<
  TConfig extends ConfigGenerators,
  TState = MutationState<CoreState>,
  TEventMap extends EventTypeMap = CoreEvents
> {
  Mutation: {
      [field: string]: GraphQLFieldResolver<
        any,
        MutationContext<TConfig, TState, TEventMap>
      >
  }
}

export interface UserMutationQuery {
  query: DocumentNode
  variables: Record<string, any>
  operationName: string
  extensions?: Record<string, any>
  setContext: (context: any) => any
  getContext: () => any
}

export interface MutationQuery<
  TConfig extends ConfigGenerators,
  TState = MutationState<CoreState>,
  TEventMap extends EventTypeMap = CoreEvents
> extends UserMutationQuery {
  setContext: (context: MutationContext<TConfig, TState, TEventMap>) => MutationContext<TConfig, TState, TEventMap>
  getContext: () => MutationContext<TConfig, TState, TEventMap>
}

export type MutationResult = ExecutionResult

export interface Mutations<
  TConfig extends ConfigGenerators,
  TState = MutationState<CoreState>,
  TEventMap extends EventTypeMap = CoreEvents
> {
  execute: (query: MutationQuery<TConfig, TState, TEventMap>) => Promise<MutationResult>
  configure: (config: ConfigArguments<TConfig>) => Promise<void>
}
