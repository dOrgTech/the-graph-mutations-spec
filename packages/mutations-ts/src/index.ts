import {
  ConfigSetters,
  ConfigGetters,
  Mutations,
  Query,
  QueryResult
} from './types'
import { ApolloLink, Observable } from 'apollo-link'
// TODO: foced to standardize here... graphql.js doesn't enforce anything...
// we could wrap and get rid of it?
import { Resolvers } from 'apollo-client'

export interface CreateMutationsOptions<T extends ConfigSetters> {
  mutations: { resolvers: Resolvers, config: T }; // TODO: type safety
  config: ConfigGetters<T>
}

export const createMutations = <T extends ConfigSetters>(
  options: CreateMutationsOptions<T>
): Mutations => {

  // Verify that the configuration getters and setters match 1:1
  const verifyConfig = (getters: any, setters: any) => {
    Object.keys(setters).forEach(key => {
      if (getters[key] === undefined) {
        throw Error(`Failed to find mutation configuration value for the property ${key}.`)
      }

      if (typeof setters[key] === "object") {
        verifyConfig(getters[key], setters[key])
      }
    })
  }

  verifyConfig(options.config, options.mutations.config)

  const context = new MutationsContext();

  // TODO:
  // create context
  // - config { }
  // - datasources.datasources.${name} -> address
  // - - catch-all getter https://stackoverflow.com/a/36111309
  // - mutationState.addTransaction(txHash)

  return async (query: Query): Promise<QueryResult> => {
    const { mutations } = options

    // Initialize the config
    const initConfig = (
      config: any,
      getters: any,
      setters: any
    ) => {
      Object.keys(setters).forEach(key => {
        if (typeof setters[key] === "function") {
          config[key] = setters[key](getters[key])
        } else {
          initConfig(config[key], getters[key], setters[key])
        }
      })
    }

    const config = { }
    initConfig(
      config,
      options.config,
      options.mutations.config
    )

    // Set the config on the context
    // TODO
    context.config = config;

    // TODO Execute the mutation
    // client = new ApolloClient()
    // client.link
    // client.mutate({ document: query, context })
    let result = await makePromise(
      execute(query, mutations, { graph: context }) // TODO: how to pass context
    )
  }
}

export const createMutationsLink =
({ mutations }: { mutations: Mutations }): ApolloLink => {
  return new ApolloLink(operation => {
    return new Observable(observer => {
      mutations({
        document: operation.query,
        variables: operation.variables,
        operationName: operation.operationName,
      }).then(
        (result: QueryResult) => {
          observer.next(result.result)
          observer.complete()
        },
        e => observer.error(e),
      )
    })
  })
}

/*
TODO: dApp
// @graphprotocol/mutations-ts
createMutations(options) => Mutations

// @graphprotocol/mutations-ts-apollo
createMutationLink({ mutations }) => MutationLink
!!! Do this first, then create classes to help with implementation,
    then move those into the mutations-ts file

// @graphprotocol/mutations-ts-apollo-react
useMutationAndSubscribe(...)

TODO: subgraph
// @graphprotocol/mutations-ts
Type safety | validators for
- config
- resolvers context
MutationState
*/
