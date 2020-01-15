import {
  ConfigSetters,
  ConfigGetters,
  Mutations,
  MutationQuery,
  MutationResult,
  MutationExecutor,
  ConfigValues
} from './types'
import {
  validateConfig,
  createConfig
} from './utils'
import {
  ManagedState,
  EventMap,
  StateBuilder
} from './mutationState';
import { DataSources } from './dataSources'
import { localResolverExecutor } from './mutation-executor'

import { BehaviorSubject } from 'rxjs'
import { GraphQLFieldResolver } from 'graphql'
import { ApolloLink, Operation, Observable } from 'apollo-link'

interface MutationsModule<
  TState,
  TEventMap extends EventMap
> {
  resolvers: {
    Mutation: {
      [resolver: string]: GraphQLFieldResolver<any, any>
    }
  },
  config: ConfigSetters,
  stateBuilder: StateBuilder<TState, TEventMap>
}

interface CreateMutationsOptions<
  TState,
  TEventMap extends EventMap,
  TConfig extends ConfigSetters
> {
  mutations: MutationsModule<TState, TEventMap>,
  subgraph: string,
  node: string,
  config: ConfigGetters<TConfig>
  mutationExecutor?: MutationExecutor
}

export const createMutations = <
  TState,
  TEventMap extends EventMap,
  TConfig extends ConfigSetters
>(
  options: CreateMutationsOptions<TState, TEventMap, TConfig>
): Mutations<TConfig> => {

  const { mutations, subgraph, node, config, mutationExecutor } = options

  // Validate that the configuration getters and setters match 1:1
  validateConfig(config, mutations.config)

  // One config instance for all mutation executions
  let configInstance: ConfigValues<TConfig> | undefined = undefined;

  // One datasources instance for all mutation executions
  const dataSources = new DataSources(
    subgraph, node, "http://localhost:5001" 
  )

  return {
    execute: async (mutationQuery: MutationQuery) => {

      const {
        getContext,
        setContext,
        uuid // TODO: use this in the state?
      } = mutationQuery

      // Create the config instance during
      // the first mutation execution
      if (!configInstance) {
        configInstance = await createConfig(
          config,
          mutations.config
        )
      }

      // See if there's been a state observer added to the context.
      // This is used for forwarding state updates back to the caller.
      // For an example, see the mutations-react package.
      const context = getContext()
      let stateObserver: BehaviorSubject<TState> = context.__stateObserver

      const state = new ManagedState<TState, TEventMap>(mutations.stateBuilder, stateObserver)

      // Use the mutations module's state class if one is defined
      //const state = new ManagedState<TState, TEventMap>(stateObserver)

      // Set the context
      setContext({
        graph: {
          config: configInstance,
          dataSources,
          state
        }
      })

      // Execute the mutation
      if (mutationExecutor) {
        return await mutationExecutor(
          mutationQuery, mutations.resolvers
        )
      } else {
        return await localResolverExecutor(
          mutationQuery, mutations.resolvers
        )
      }
    },
    configure: async (config: ConfigGetters<TConfig>) => {
      validateConfig(config, mutations.config)
      configInstance = await createConfig(config, mutations.config)
    }
  }
}

export const createMutationsLink = <TConfig extends ConfigSetters>(
  { mutations }: { mutations: Mutations<TConfig> }
): ApolloLink => {
  return new ApolloLink((operation: Operation) =>
    new Observable(observer => {
      mutations.execute({
        query: operation.query,
        variables: operation.variables,
        operationName: operation.operationName,
        setContext: operation.setContext,
        getContext: operation.getContext,
        uuid: operation.toKey()
      }).then(
        (result: MutationResult) => {
          observer.next(result.result)
          observer.complete()
        },
        (e: Error) => observer.error(e)
      )
    })
  )
}

export * from './mutationState'
