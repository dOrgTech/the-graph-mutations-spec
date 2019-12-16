import {
  createMutations, createMutationsLink
} from '../src'
import localExecutor from '../src/mutation-executor/local-resolvers'

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
  }
}

const mutations = createMutations({
  mutations: {
    resolvers,
    config
  },
  // TODO: be sure to support function (+ async)
  config: {
    a: "Fred",
    b: 4
  },
  mutationExecutor: localExecutor
})

const link = createMutationsLink({ mutations })

/* mutations({
  document: mutation,
  variables: variables,
  operationName: operation.operationName
})
*/
