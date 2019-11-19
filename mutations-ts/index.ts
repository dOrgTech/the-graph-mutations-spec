// npmjs.com/package/@graphprotocol/mutation-resolvers

interface RequiredContext {
  ethereum: (provider: any) => any
}

class Resolvers {
  constructor(config) {
    fail if config !== static.config
  }
}

// dapp
import { mutations } from "graphprotocol/mutations"
import gravatarMutations from "gravatars" // default export
 
gravatarMutations.config // static config [Ethereum, IPFS]
gravatarMutations.resolvers // resolvers the developer implements

let m = mutations(gravatarMutations, { ethereum: ..., ipfs: ... }) 

m.resolvers // wrapped resolvers that verify context is there

new ApolloClient({
  resolvers: m.resolvers,
  context: ...m.context // graphprotocol
})

// resolvers
context.graphprotocol... (provider(s), IPFS) 
