import {
  createMutations,
  createMutationsLink,
  StateBuilder
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
  },
  c: {
    d: {
      e: (value: boolean) => {
        return 'hey'
      }
    }
  }
}

const stateBuilder: StateBuilder<{ }> = {
  getInitialState() {
    return { }
  }
}

const mutations = createMutations({
  mutations: {
    resolvers,
    config,
    stateBuilder
  },
  subgraph: 'my-subgraph',
  node: 'https://graph-node.io',
  config: {
    a: async () => '',
    b: 4,
    c: { d: { e: () => true } }
  }
})

const link = createMutationsLink({ mutations })
