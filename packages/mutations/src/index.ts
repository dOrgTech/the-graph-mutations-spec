import {
  Mutations,
  MutationsModule,
  MutationQuery,
  MutationResult
} from './types'
import {
  ConfigGenerators,
  ConfigArguments,
  ConfigProperties
} from './config'
import {
  validateConfig,
  createConfig
} from './config'
import {
  StateUpdater,
  EventTypeMap,
  CoreState
} from './mutationState'
import { getUniqueMutations } from './utils'
import { DataSources } from './dataSources'
import executors, { MutationExecutor } from './mutationExecutors'

import { v4 } from 'uuid'
import { BehaviorSubject, combineLatest } from 'rxjs'
import { ApolloLink, Operation, Observable } from 'apollo-link'

interface CreateMutationsOptions<
  TConfig extends ConfigGenerators,
  TState,
  TEventMap extends EventTypeMap
> {
  mutations: MutationsModule<TConfig, TState, TEventMap>,
  subgraph: string,
  node: string,
  config: ConfigArguments<TConfig>
  mutationExecutor?: MutationExecutor
}

const createMutations = <
  TConfig extends ConfigGenerators,
  TState = CoreState,
  TEventMap extends EventTypeMap = { },
>(
  options: CreateMutationsOptions<TConfig, TState, TEventMap>
): Mutations<TConfig> => {

  const { mutations, subgraph, node, config, mutationExecutor } = options

  // Validate that the configuration getters and setters match 1:1
  validateConfig(config, mutations.config)

  // One config instance for all mutation executions
  let configProperties: ConfigProperties<TConfig> | undefined = undefined

  // One datasources instance for all mutation executions
  const dataSources = new DataSources(
    subgraph, node, 'http://localhost:5001'
  )

  // Wrap the resolvers and add a mutation state instance to the context
  const resolverNames = Object.keys(mutations.resolvers.Mutation)

  for (let i = 0; i < resolverNames.length; i++) {
    const name = resolverNames[i]
    const resolver = mutations.resolvers.Mutation[name]

    // Wrap the resolver
    mutations.resolvers.Mutation[name] = async (source, args, context, info) => {
      const rootObserver = context.graph.__rootObserver
      const mutationObservers: BehaviorSubject<TState>[] = context.graph.__mutationObservers
      const mutationsCalled = context.graph.__mutationsCalled

      if (rootObserver && mutationObservers.length === 0) {
        for (const mutation of mutationsCalled) {
          mutationObservers.push(new BehaviorSubject<TState>({} as TState));
        }

        combineLatest(mutationObservers).subscribe((values: TState[]) => {
          const result: {[key: string]: TState} = {}

          values.forEach((value, index) => {
            result[mutationsCalled[index]] = value;
          })

          rootObserver.next(result)
        })
      }

      // Generate a unique ID for this resolver execution
      let uuid = v4()

      const state = new StateUpdater<TState, TEventMap>(
        uuid, mutations.stateBuilder, rootObserver ? mutationObservers.shift() : undefined
      )

      // Create a new context with the state added to context.graph
      const newContext = { ...context, graph: { ...context.graph, state } }

      // Execute the resolver
      return await resolver(source, args, newContext, info)
    }
  }

  return {
    execute: async (mutationQuery: MutationQuery) => {

      const { setContext,getContext, query } = mutationQuery

      // Create the config instance during
      // the first mutation execution
      if (!configProperties) {
        configProperties = await createConfig(
          config,
          mutations.config
        )
      }

      const context = getContext()

      // Set the context
      setContext({
        graph: {
          config: configProperties,
          dataSources,
          __rootObserver: context.graph ? context.graph.__stateObserver : undefined,
          __mutationObservers: [],
          __mutationsCalled: getUniqueMutations(query, Object.keys(mutations.resolvers.Mutation)),
        }
      })

      // Execute the mutation
      if (mutationExecutor) {
        return await mutationExecutor(
          mutationQuery, mutations.resolvers
        )
      } else {
        return await executors.localResolver(
          mutationQuery, mutations.resolvers
        )
      }
    },
    configure: async (config: ConfigArguments<TConfig>) => {
      validateConfig(config, mutations.config)
      configProperties = await createConfig(config, mutations.config)
    }
  }
}

const createMutationsLink = <TConfig extends ConfigGenerators>(
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

export {
  createMutations,
  createMutationsLink,

  // mutationExecutors
  executors,
  MutationExecutor
}

export {
  CoreState,
  CoreEvents,
  Event,
  EventTypeMap,
  EventPayload,
  MutationState,
  ProgressUpdateEvent,
  StateBuilder,
  StateUpdater,
  TransactionCompletedEvent,
  TransactionCreatedEvent,
  TransactionErrorEvent
} from './mutationState'
