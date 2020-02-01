import {
  createMutations,
  createMutationsLink,
  MutationContext
} from '../src'
import exampleMutations, { State, EventMap, Config } from './mutations'

import gql from 'graphql-tag'

// Create Executable & Executable Mutations
const mutations = createMutations({
  mutations: exampleMutations,
  subgraph: 'my-subgraph',
  node: 'https://graph-node.io',
  config: {
    a: async () => '',
    b: 3,
    c: {
      d: {
        e: () => true
      }
    }
  }
})

// Create an ApolloLink to execute the mutations
const link = createMutationsLink({ mutations })

// Execute a mutation without Apollo
const EXAMPLE = gql`
  mutation example($input: String!) {
    example(input: $input) @client{
      output
    }
  }
`

type Context = MutationContext<Config, State, EventMap>
let context = { } as Context

mutations.execute({
  query: EXAMPLE,
  variables: {
    input: "..."
  },
  operationName: "mutation",
  setContext: (newContext: Context) => {
    context = newContext
    return context
  },
  getContext: () => context
})
