import {
  Mutations,
  MutationsModule,
  MutationQuery,
  MutationResult,
  MutationExecutor,
} from './types'
import {
  ConfigSetters,
  ConfigGetters,
  ConfigValues,
  validateConfig,
  createConfig
} from './config'
import {
  ManagedState,
  EventMap
} from './mutationState'
import { DataSources } from './dataSources'
import { localResolverExecutor } from './mutation-executor'
import { v4 } from 'uuid'
import { BehaviorSubject } from 'rxjs'
import { ApolloLink, Operation, Observable } from 'apollo-link'

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
  let configInstance: ConfigValues<TConfig> | undefined = undefined

  // One datasources instance for all mutation executions
  const dataSources = new DataSources(
    subgraph, node, "http://localhost:5001" 
  )

  // Wrap the resolvers and add a mutation state instance to the context
  const resolverNames = Object.keys(mutations.resolvers.Mutation)
  for (let i = 0; i < resolverNames.length; ++i) {
    const name = resolverNames[i]
    const resolver = mutations.resolvers.Mutation[name]

    // Wrap the resolver
    mutations.resolvers.Mutation[name] = (source, args, context, info) => {
      // TODO: fix the observers (root observer => { observer1, observer2, etc })

      // See if there's been a state observer added to the context.
      // This is used for forwarding state updates back to the caller.
      // For an example, see the mutations-react package.
      let stateObserver: BehaviorSubject<TState> = context.graph.__stateObserver

      // Generate a unique ID for this resolver execution
      let uuid = v4()

      const state = new ManagedState<TState, TEventMap>(
        uuid, mutations.stateBuilder, stateObserver
      )

      // Create a new context with the state added to context.graph
      const newContext = { ...context, graph: { ...context.graph, state } }

      // Execute the resolver
      resolver(source, args, newContext, info)
    }
  }

  return {
    execute: async (mutationQuery: MutationQuery) => {

      const { setContext } = mutationQuery

      // Create the config instance during
      // the first mutation execution
      if (!configInstance) {
        configInstance = await createConfig(
          config,
          mutations.config
        )
      }

      // Set the context
      setContext({
        graph: {
          config: configInstance,
          dataSources
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
        getContext: operation.getContext
      }).then(
        (result: MutationResult) => {
          observer.next(result)
          observer.complete()
        },
        (e: Error) => observer.error(e)
      )
    })
  )
}

export * from './mutationState'
