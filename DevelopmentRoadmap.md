# Milestones
1. MVP  
2. graph-node Support + CLI Improvements  
3. Server Side Execution  
4. The Graph Explorer Support

# 1. MVP
## Deliverables
* `@graphprotocol/mutations-ts` Package
* Functional Gravatar dApp w/ Mutations  
  * Note: `context.graph.datasources...` not available yet, see Milestone 2.
* `graph-cli build` Support

## Details (WIP)
### @graphprotocol/mutations-ts
- initMutations
  - create context with initial values that're provided
  - verify all of required context is initialized
  - add datasource addresses to context (requires graph-node connection)
  - wrap resolvers in a function that injects context

### Demo dApp functional!
The spec is already there.

### `graph cli integration`  
- [x] combine & parse the mutation's schema.graphql
- [x] validate mutations.yaml
- [x] validate subgraph.yaml
- [x] open & validate resolvers module
- [x] upload mutation files to IPFS
- [x] output to the build directory

# 2. Tests + Added Features
## Deliverables
* API tests
* datasources fetch
* optimistic updates
* resolver state updates
* `graph-cli init` Support

## Details (WIP)
`graph init`
- will add a mutation resolvers package for developers to start implementing from.

# 3. Server Side Execution
## Deliverables
* graph-node can now accept mutation queries and execute resolvers server side.

## Details (WIP)

# 4. *The Graph* Explorer Support
## Deliverables
* *The Graph* Explorer now supports Mutations

## Details (WIP)