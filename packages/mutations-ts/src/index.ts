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
import { getUniqueMutations } from './utils'
import { DataSources } from './dataSources'
import { localResolverExecutor } from './mutation-executor'
import { v4 } from 'uuid'
import { BehaviorSubject, combineLatest } from 'rxjs'
import { mergeMap, mergeAll, map } from 'rxjs/operators'
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
  const observables: BehaviorSubject<TState>[] = []
  
  for (let i = 0; i < resolverNames.length; i++) {
    const name = resolverNames[i]
    const resolver = mutations.resolvers.Mutation[name]

    // Wrap the resolver
    mutations.resolvers.Mutation[name] = async (source, args, context, info) => {
      let stateObserver: BehaviorSubject<{[key: string]: TState}> = context.graph.__stateObserver
      let mutationNames: string[] = context.graph.mutationsCalled

      if(observables.length === 0){
        for (let j = 0; j < mutationNames.length; ++j) {
          observables.push(new BehaviorSubject<TState>({} as TState));
        }
        combineLatest(observables).subscribe((values: TState[])=>{
          const result: {[key: string]: TState} = {}
          values.forEach((value, index) => {
            result[mutationNames[index]] = value;
          })
          stateObserver.next(result)
        })
      }

      // TODO: fix the observers (root observer => { observer1, observer2, etc })

      // See if there's been a state observer added to the context.
      // This is used for forwarding state updates back to the caller.
      // For an example, see the mutations-react package.

      // Generate a unique ID for this resolver execution
      let uuid = v4()

      const state = new ManagedState<TState, TEventMap>(
        uuid, mutations.stateBuilder, observables.shift()
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
      if (!configInstance) {
        configInstance = await createConfig(
          config,
          mutations.config
        )
      }

      //Check to see if 'graph' context object exists
      if(!getContext().graph) throw new Error("'graph' context object has not been set")

      // Set the context
      setContext({
        graph: {
          __stateObserver: getContext().graph.__stateObserver,
          config: configInstance,
          dataSources,
          mutationsCalled: getUniqueMutations(query, Object.keys(mutations.resolvers.Mutation))
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
