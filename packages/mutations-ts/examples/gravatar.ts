import {
  createMutations, createMutationsLink
} from '../src'
import { localResolverExecutor } from '../src/mutation-executor'

const resolvers = {
  Mutation: {
    execFoo: () => {},
    execBar: () => {}
  }
}

const config = {
  a: (name: string) => {
    return `Hi my name is ${name}!`
  },
  b: (value: number) => {
    return 1 + value
  },
  c: {
    d: {
      e: (value: boolean) => {
        return 'hey'
      }
    }
  }
}

const mutations = createMutations({
  mutations: {
    resolvers,
    config
  },
  subgraph: 'my-subgraph',
  node: 'https://graph-node.io',
  config: {
    a: async () => '',
    b: 4,
    c: { d: { e: () => true } }
  },
  mutationExecutor: localResolverExecutor
})

const link = createMutationsLink({ mutations })

/* mutations({
  document: mutation,
  variables: variables,
  operationName: operation.operationName
})
*/
