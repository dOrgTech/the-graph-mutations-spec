import {
  createMutations
} from '../src'

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
  config: {
    a: "Fred",
    b: 4
  }
})

/* mutations({
  document: mutation,
  variables: variables,
  operationName: operation.operationName
})
*/
