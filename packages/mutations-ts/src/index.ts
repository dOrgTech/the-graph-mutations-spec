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
} from './utils/configUtils'
import {
  MutationState
} from './class/mutationState';

// TODO: move to mutations-apollo
import { Resolvers } from 'apollo-client' // TODO: Forced to depend on apollo here... maybe wrap the resolvers and make them agnostic?
import { ApolloLink, Operation, Observable } from 'apollo-link'
import DataSources from './class/dataSources'

export interface CreateMutationsOptions<TConfig extends ConfigSetters> {
  mutations: { resolvers: Resolvers, config: TConfig }
  config: ConfigGetters<TConfig>
  mutationExecutor: MutationExecutor
}

export const createMutations = <TConfig extends ConfigSetters>(
  options: CreateMutationsOptions<TConfig>
): Mutations<TConfig> => {

  const { mutations, mutationExecutor } = options

  // Validate that the configuration getters and setters match 1:1
  validateConfig(options.config, mutations.config)

  // Create a config instance object here to be used within
  // execute function.
  let configInstance: ConfigValues<TConfig> | undefined = undefined;

  return {
    execute: async (mutationQuery: MutationQuery) => {

      const {
        getContext,
        setContext,
        uuid
      } = mutationQuery

      if (!configInstance) {
        configInstance = await createConfig(
          options.config,
          mutations.config
        )
      }

      const dataSources = new DataSources(
        // TODO: why is graphNodeUrl coming from config?
        options.config.graphNodeURL as string,
        configInstance.ipfs
      )

      const context = getContext()

      setContext({
        thegraph: {
          config: configInstance,
          dataSources,
          state: new mutations.State(context.__stateObserver)
        }
      })

      return await mutationExecutor(
        mutationQuery, mutations.resolvers
      )
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

export {MutationState}

/*
TODO:
// @graphprotocol/mutations-ts-apollo-react
useMutationAndSubscribe(...)

TODO: subgraph
// @graphprotocol/mutations-ts
Type safety | validators for
- config
- resolvers context
MutationState
*/
