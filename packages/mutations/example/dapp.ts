import {
  createMutations,
  createMutationsLink
} from '../src'
import exampleMutations from './mutations'

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

const link = createMutationsLink({ mutations })
