# **The Graph - Mutation Support**
**NOTE: This project has been moved to https://github.com/graphprotocol/mutations**
## Intro
GraphQL mutations allow developers to add executable functions to their schema. Callers can invoke these functions using GraphQL queries.

## Specification
https://github.com/graphprotocol/rfcs/pull/10

## Repo Structure
This monorepo contains an e2e prototype, showing how mutations can be added to The Graph's existing tool-chain.

[`./packages`](./packages)  
Runtime packages for mutation & dApp developer.  
  * [`mutations`](./packages/mutations)  
  Javascript API used within mutation modules & dApps. This API includes functions, classes, and interfaces to support:  
    * Mutation Resolvers  
    * Mutation Context  
    * Mutation State  
    * Mutation Configuration  
    * Instantiation  
    * Executing  
  * [`mutations-apollo-react`](./packages/mutations-apollo-react)  
  Utility wrappers around commonly used hooks and components for React applications that use Apollo.  
  * [`mutations-apollo-vue`](./packages/mutations-apollo-vue)  
  Coming soon.  

[`./example`](./example)  
Example mutation integration into an existing subgraph & dApp.  
  * [`subgraph`](./example/subgraph)  
  * [`dapp-react`](./example/dapp-react)  

[`./graph-cli`](./graph-cli)  
A version of the `graph-cli` that supports mutations.  

## Setup & Run
Prerequisites:  
* `git`
* `nvm`
* `yarn`
* `docker-compose`

Run these commands from the root directory:

* Install all dependencies  
  * `nvm install $(cat .nvmrc)`  
  * `nvm use $(cat .nvmrc)`  
  * `yarn`
* Build all packages  
  * `yarn build:packages`  
* Build the example mutations & subgraph  
  * `yarn build:example`  
* (CMD 1) Start the environment  
  * `yarn start:subgraph`  
* (CMD 2) Start the dApp  
  * `yarn start:dapp`  
* Setup Metamask
  * Use "localhost:8545" provider
  * The following private keys have testnet funds
    * 0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d
    * 0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1
    * 0x6370fd033278c143179d81c5526140625662b8daa446c22ee2d73db3707e620c
    * 0x646f1ce2fdad0e6deeeb5c7e8e5543bdde65e86029e2fd9fc169899c440a7913
    * 0xadd53f9a7e588d003326d1cbf9e4a43c061aadd9bc938c843a79e7b4fd2ad743
    * 0x395df67f0c2d2d9fe1ad08d1bc8b6627011959b79c53d7dd6a3536a33ab8a4fd
    * 0xe485d098507f54e7733a205420dfddbe58db035fa577fc294ebd14db90767a52
    * 0xa453611d9419d0e56f499079478fd72c37b251a94bfde4d19872c44cf65386e3
    * 0x829e924fdf021ba3dbbc4225edfece9aca04b929d6e75613329ca6f1d31c0bb4
    * 0xb0057716d5917badaf911b193b12b910811c1497b5bada8d7711f758981c3773
  * NOTE: If transactions fail try clearing the account history, which will reset the nonce to 0.
* Stop Subgraph & Clean Cache
  * `yarn stop:subgraph`
  * NOTE: This requires root permissions as it deletes the protected cache directory `./example/subgraph/data`.
