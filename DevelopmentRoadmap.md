# Milestones
1 - MVP
2 - Graph Node Support
3 - Explorer Support & Nice to haves?

# Milestone 1 - "MVP"
1. Graph CLI `subgraph.yaml` & `mutations.graphql` Parsing
TODO:
- update manifest-schema.graphql with the new fields that're being added to the subgraph manifest file
- update validation/schema.js and validation/manifest.js
- update tests with all new output + errors for effected commands

build
- combine & parse the mutation's schema.graphql
- parse mutations.yaml
- parse subgraph.yaml
- open & validate resolvers module
deploy
- upload js module to ipfs + add to subgraph.yaml
- upload schema for introspection

@graphprotocol/mutations-ts
- initMutations
  - create context with initial values that're provided
  - verify all of required context is initialized
  - add datasource addresses to context (requires graph-node connection)
  - wrap resolvers in a function that checks context to make sure it's there
