# Milestones
1. MVP  
2. graph-node Support + CLI Improvements  
3. Server Side Execution  
4. The Graph Explorer Support

# 1. MVP
## Deliverables
* `@graphprotocol/mutations-ts` Package
* Functional Gravatar dApp w/ Mutations  
  * Note: `context.thegraph.datasources...` not available yet, see Milestone 2.
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

### `graph build`  
Logic: 
- [x] combine & parse the mutation's schema.graphql
- [x] validate mutations.yaml
- [x] validate subgraph.yaml
- [x] open & validate resolvers module

Relevant Code:
- [x] update manifest-schema.graphql with the new fields that're being added to the subgraph manifest file
- [x] update validation/manifest.js
- [x] update validation/schema.js
- [x] update tests with all new output + errors for effected commands

# 2. graph-node Support
## Deliverables
* `graph-cli deploy` Support
* graph-node Schema Introspection W/ Mutations
* graph-node Datasources Fetch
* `graph-cli init` Support

## Details (WIP)
`graph deploy`
- upload js module to ipfs + add hash to subgraph.yaml
- upload schema to graph-node for introspection

graph-node Introspection Endpoint Supports Mutation Schema

// TODO: code marker in graph-node where it rejects the new schema of the subgraph manifest yaml file.

graph-node Datasources Endpoint

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