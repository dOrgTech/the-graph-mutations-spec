# **The Graph - Mutation Support**
## Intro
GraphQL mutations allow developers to add executable functions to their schema. Callers can invoke these functions using GraphQL queries.

## Specification
https://github.com/graphprotocol/rfcs/pull/10

## Repo Structure
This monorepo contains an e2e prototype, showing how mutations can be added to The Graph's existing tool-chain.

[`./packages`](./packages)  
Runtime packages for mutation & dApp developer.  
  * [`mutations-ts`](./packages/mutations-ts)  
  Typescript API used within mutation javascript modules & dApps that use mutations. This API includes functions, classes, and interfaces to support:  
    * Mutation Resolvers  
    * Mutation Context  
    * Mutation State  
    * Mutation Configuration  
    * Instantiation  
    * Querying  
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
* Build the example  
  * `yarn build:example`  
* (CMD 1) Start the environment  
  * `yarn start:subgraph`  
* (CMD 2) Start the dApp  
  * `yarn start:dapp`  
