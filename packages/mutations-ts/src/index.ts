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
} from './configUtils'

import {
  getSubgraphs,
  getABIs,
  IDataSource,
  IEthereumContractAbi
} from './datasourceUtils'

// TODO: move to mutations-apollo
import { Resolvers } from 'apollo-client' // TODO: Forced to depend on apollo here... maybe wrap the resolvers and make them agnostic?
import { ApolloLink, Operation, Observable } from 'apollo-link'
import { HttpLink } from 'apollo-link-http';

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

      const link = new HttpLink({ uri: `${options.config.graphNodeURL}/subgraphs` });
      const { data } = await getSubgraphs(link)
      if(!data) throw new Error("Error fetching subgraph metadata")

      const dataSources = data.subgraphs[0].currentVersion.deployment.manifest.dataSources as IDataSource[];
      
      const proxyDataSources = dataSources.map((dataSource) => {
        return new Proxy(dataSource, {
          get: (target, name) => {
            switch(name){
              case 'abi': {
                return new Promise((resolve, reject) => {
                  getABIs(
                    link,
                    {name: target.name}
                  ).then((res) => {
                    if(res){
                      const {data} = res
                      if(!data) throw new Error(`Error fetching ABIs for subgraph with name '${target.name}'`)
                      const ethereumContractAbis = data.ethereumContractAbis as IEthereumContractAbi[];
                      resolve(ethereumContractAbis[0].file);
                    }
                  })
                }) 
              }
              case 'address': {
                return target.source.address;
              }
              case 'name': {
                return target.name;
              }
            }
          }
        })
      })

      const {
        setContext,
        uuid
      } = mutationQuery

      if (!configInstance) {
        configInstance = await createConfig(
          options.config,
          mutations.config
        )
      }

      setContext({
        thegraph: {
          config: configInstance,
          dataSources: proxyDataSources
        }
      })

      // TODO:
      // context
      // - config { }
      // - datasources.${name} -> address & abi
      // - - catch-all getter https://stackoverflow.com/a/36111309
      // - mutationState.addTransaction(txHash)

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
