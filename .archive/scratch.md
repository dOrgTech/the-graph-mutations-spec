# The Graph
1. Define new feature
2. Protocol Dev Experience
3. App Dev Experience
4. Feature Implementation
5. Future Looking

# Questions
* Is Graph-Node affected at all?
* How to handle the web3 provider? Should we assume the library will "figure it out"? Should we require they implement a function that's called "setWeb3Provider"?
* Don't support @client https://www.apollographql.com/docs/react/data/local-state/#handling-client-fields-with-resolvers
* What do optimistic updates look like?
* Verify the mutation's provider & graph-node's provider have the same network ID.
* schema introspection
* hot reloading (explorer)

# TODO
* Update Issue W/ Initial Feature Spec
* Update Issue W/ Implementation Level Details
* Create Repo W/ Spec, Issues, Milestones
* Project Board
* Share W/ dOrg
* Share W/ The Graph

# Formative Decisions
* Couple reading (mappings) & writing (mutations) package versions.
  * This will ensure the mutations aren't used with an incompatible schema.
  * Downside is that when the mutations are updated, and mappings are unchanged, nodes will reindex regardless.
  * Alternative: Make them seperate packages, and have the mutations define what schema versions they're compatible with.
* Mutations are defined in GraphQL, and mapped to JS functions which are assumed to have properly implemented the interface.
  * This will ensure the types used in the function definition are GraphQL compatible / native. If they weren't, querying wouldn't be possible.
  * Developer documentation on how GraphQL types map to JS will be created. TDD will be highly encouraged to ensure types are being used correctly within the mutation.
  * Upside to this is using other GraphQL data types as parameters is possible. (TODO: is this possible in GraphQL?)
  * This may seem common sense, but there is an alternative.
  * Alternative: Mutations are defined in JS, and mapped to auto-generated GraphQL interfaces.
    * I think this makes the feature more language dependent than the previous solution, as walking the JS AST to figure out what to generate is more complex than defining a mapping from GraphQL => JS. The mapping can be easily reproduced in other languages (AssemblyScript, Rust, etc).
    * AST can still be used to added security later on down the line, but don't think we should be depdent on it for the feature.

# Protocol Dev Experience Changes
## schema.graphql
```graphql
type Mutations {
  createGravatar(
    displayName: String!,
    imageUrl: String!
  ): Gravatar

  updateGravatarName(
    displayName: String!
  ): Gravatar

  updateGravatarImage(
    imageUrl: String!
  ): Gravatar
}
```

## subgraph.yaml
```yaml
mutationResolvers:
  kind: javascript
  package: ./src/mutations/package.json
```
kind - The runtime environment + language the mutations are defined in.

kind = (for example)
    javascript |
    wasm

NOTE: javascript is assumed to be es5 compatible.
NOTE: we don't need to differentiate between server/javascript and client/javascript mutation resolver packages. The developer's code shouldn't have to change in either case. More on this further down in the "Thing Server Side" section.

package - Since the user selected javascript, we'll expect the `package` property to point to their package.json. We verify it has a `main` property, pointing to the program's entry point. More on this in the "src/mutations" section.

## Mutation Resolvers
### TODO: Developing Your Muations

### Generating ApolloClient Resolvers
`graph bind ./schema.graphql ./package.json`
^^^ (1) gets mutations from schema.graphql (2) verifies each mutation has an exported definition in javascript (3) if all exist, it generates ApolloClient & ApolloServer compatible resolver code and outputs it in the package's `./resolvers` folder.

// TODO: show what the resolver code looks like
// - Top level type

### TODO: Subgraph Build Pipeline Changes
TODO: build mutations and verify they're es5. This would be added to the CLI.
TODO: ensure 1:1:1 for GraphQL -> resolver -> definition
TODO: don't support non-subgraph-level mutations

## TODO: Publishing Your Subgraph
// TODO: notes on publishing to the explorer here
/home/jelli/Dev/Repos/dOrg/TheGraph/ethdenver-dapp/README.md

Develoeprs can push their mutation packages to npm if they'd like users to consume it that way, or they can let The Graph host it for them when they publish their subgraph. For the initial prototype, we can just use npm packages, but I think we'll want to standardize on having the nodes act as package repositories. To ensure the package's entegrety, it's hash can be stored and queryable within the node, which can be verified using The Graph's query validation logic.

`graph install gravatars/mutations` == `npm i --save gravatar/mutations`

# App Dev Experience
## Package Consumption
// TODO: describe each (one for initial prototype, one for final form. upsides & downsides of each.)
`npm i --save gravatar`
`graph install gravatar`

```Typescript
import Resolvers from 'gravatar/mutations/resolvers'

const resolvers = new Resolvers();

const client = new ApolloClient({
  ...options,
  resolvers: resolvers
});

// TODO: this could just be inherited from the graph-node? Might be the reason to use the query engine? If this method is used, we'd want to have checking code to make sure this node has the same network ID as the graph-node's connection.
resolvers.setWeb3Provider("...");

// TODO: query example
```

# Implementation Strategy
TODO
1st (1 1/2 months) =
* graph-node GraphQL Mutation Support (manifest, schema)
* graph-cli bind mutations (verify mutations, generate resolvers)
* create example application (npm linking in mutation package)

2nd (1 1/2 months) =
* graph-node mutation package hosting
* graph-cli publish mutations
* graph-cli install mutations
* graph-node mutation package verification (ensure 1:1:1 GraphQL:Resolver:JS)

# Future Looking
## Server Side Mutations
When running these mutation packages on a server, the only things that would change are:
1. Run them within a containerized env to ensure security.
2. Inject ourselves like Metamask does so we can intercept signature requests.
3. Upon signature request, ask the client who called into the mutation for their signature.
4. The client would need to support this behaviour (possibly requiring the client query engine that's currently WIP).
5. When the developer calls `graph bind-mutations`, tthey might need to specify it's for Apollo Server instead of the Apollo Client, or it could just generate both.

## Optimistic Updates
TODO: what does this look like?
