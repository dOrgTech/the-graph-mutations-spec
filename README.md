# **The Graph - Mutation Support**
This document starts with the "Gravatars" example project, and walks through the steps a developer would take to add Mutations to the subgraph and dApp.    

Original source available here:  
[`./subgraph`](./subgraph): https://github.com/graphprotocol/example-subgraph  
[`./dapp`](./dapp): https://github.com/graphprotocol/ethdenver-dapp  

# User Story: Protocol Developer

Starting in the [./subgraph](./subgraph) folder...

## Step 1: Define Mutations

[`mutations.graphql`](./subgraph/src/mutations/mutations.graphql)
```graphql
type GravatarOptions {
  displayName: String!
  imageUrl: String!
}

type Mutations {
  createGravatar(
    options: GravatarOptions!
  ): Gravatar

  updateGravatarName(
    displayName: String!
  ): Gravatar

  updateGravatarImage(
    imageUrl: String!
  ): Gravatar
}
```

**NOTE:** GraphQL types from the subgraph's [schema.graphql](./subgraph/schema.graphql) file can be used within this file.

### Decisions Made
**Define Mutations In GraphQL:** In our last call, the idea of defining the mutations in the manifest file was brought up. I saw this as very limiting, as it removes the ability to define additional datatypes that can be used as argument or return values within the mutation's function signature. Additionally, keeping everything in GraphQL promotes consistency and predictability for how types will be bound to the resolver's implementation language, since that standard is already defined for us by GraphQL tooling. Lastly, this also allows you to use subgraph entity types within your mutation definitions.

**Define Mutations In a Seperate GraphQL File:** In order to promote the decoupling of codebases (subgraph mappings & mutations), defining the mutations in a seperate GraphQL file is desired. An added benefit is that this helps keep write-specific data types seperate from the main schema of the entity store. To illustrate this, see "GravatarOptions" in the example above. Further decoupling could be done through having a completely deperate .yaml file for the mutations project. ***This might be ideal*** as it would potentially allow publishing mutations for pre-existing subgraphs without bumping the version (and changing the endpoint). If a seperate .yaml file isn't introduced, it leads to a weird circular dependency graph `subgraph mappings <=> mutations`, ideally it'd be unidirectional `subgraph mappings <= mutations`.

## Step 2: Add Mutations To Subgraph Manifest

[`subgraph.yaml`](./subgraph/subgraph.yaml)
```yaml
specVersion: 0.0.3
...
schema:
  file: ./schema.graphql
mutations:
  file: ./mutations/mutations.graphql
  resolvers:
    kind: javascript
    package: ./mutations/package.json
```

### Decisions Made
**Multiple Kinds of Mutation Resolvers:** In the future, we may want to support resolvers written in AssemblyScript (WASM).  

**Server-Side == Client-Side Resolvers:** Originally, I had "`kind: browser/javascript`", but realized that (1) Apollo GraphQL resolvers have the same signature client-side as they do server-side, and (2) implementing server-side resolvers within graph-node could (and should) be done in a way that doesn't require any code changes from the mutation developer (see "Post MVP Goals" section below).

### Open Questions
* Rename `javascript` to `nodejs` in the `kind:` property?

## Step 3: Create The Resolvers' JavaScript Package
The requirements for the [JavaScript Package](./subgraph/src/mutations/package.json) are:
1. Include a root module within the [package.json](./subgraph/src/mutations/package.json)  
  `"main": "./path/to/index.js"`
2. The [root module](./subgraph/src/mutations/src/index.js) exports a `resolvers` object, which defines all mutations (see example below).  
3. The [root module](./subgraph/src/mutations/src/index.js) exports a `setWeb3Provider(provider)` method, which is assumed to set the Web3 Provider for the resolvers to use.  
**NOTE:** the resolvers could choose to infer the Web3 provider for the user if none is set, but the option to explicitely set one is necessary in my opinion (see "Decisions Made" section below).

[`index.js`](./subgraph/src/mutations/src/index.js)
```js
export const resolvers = {
  Mutations: {
    async createGravatar(_root, args, context) {
      ...
    },
    async updateGravatarName(_root, args, context) {
      ...
    },
    async updateGravatarImage(_root, args, context) {
      ...
    }
  }
}

export function setWeb3Provider(provider) {
  ...
}
```

### Decisions Made
**Require A "Set Web3 Provider" Function:** The state of client-side Web3 wallets is always changing, and I do not think we should leave it up to the mutation developer to be able to future proof their implementations. In order to remidy this, a simple setter is a good compromise in my opinion. This also helps in the server-side mutations implementation path (see "Post MVP Goals" section below). The setter function as it exists now is a singleton pattern, and I'd like to find a way to have it be instance based to support multiple providers, the same way `ApolloClient` is an instance based approach.

## Step 4: Build & Publish Subgraph

The `graph build` CLI command will now...
1. Parse the `mutations` section of [the manifest](./subgraph/subgraph.yaml)
2. Resolve, parse, and validate the [mutation GraphQL definitions](./subgraph/src/mutations/mutations.graphql) from the `mutations.file` property
3. Resolve, load, and validate the [resolvers' implementation](./subgraph/src/mutations/package.json) from the `mutations.resolvers` property, ensuring all required exports are present (resolvers object & setWeb3Provider function)

The `graph deploy` CLI command will now...
1. Add mutations schema to the graph-node for introspection purposes (see "Post MVP Goals" section).
2. Upload the resolvers' package to the graph-node, allowing users to download the package directly from the graph-node and not an external package repository (see "Post MVP Goals" section).

**NOTE:** For the MVP, the package can just be hosted on http://npmjs.com.

# User Story: Application Developer

Moving onto the [./dapp](./dapp) folder...

## Step 1: Consume Mutation Resolvers
`npm i --save mutation-resolvers-package`

**NOTE:** In the future, the `--registry` flag could be added to download from a graph-node, or a graph-cli command could be added (see "Post MVP Goals" section below).

## Step 2: Add Mutation Resolvers To App
[`App.js`](./dapp/src/App.js)
```javascript
import { resolvers, setWeb3Provider } from "mutation-resolvers-package"

setWeb3Provider("...")

const client = new ApolloClient({
  ...
  resolvers
})
```

## Step 3: Execute Mutations

[`App.js`](./dapp/src/App.js)
```javascript
const CREATE_GRAVATAR = gql`
  mutation createGravatar($options: GravatarOptions) {
    createGravatar(options: $options) {
      id
      owner
      displayName
      imageUrl
    }
  }
`
```
```html
<Mutation
  mutation={CREATE_GRAVATAR}
  variables={{
    options: { displayName: "...", imageUrl: "..." }
  }}
>
  {(execMutation) => (
    <button onClick={execMutation}>
      Create Gravatar
    </button>
  )}
</Mutation>
```

Celebrate!

# Post MVP Goals
## GraphQL Schema Introspection Endpoint
Ensure that the full schema + mutations can be queried from the graph-node's GraphQL endpoint, enabling full schema introspection.

## *The Graph* Explorer Support (Dynamic Loading)
As a short term solution, The Graph Explorer can (if I'm not mistaken) dynamically load and use Mutation Resolver packages by making use dynamic module importing. In the future, "Server Side Execution" is in my opinion the "real" solution to this problem. See section below.

## Graph-Node Package Hosting
Host the Mutation Resolver package from the graph-node, so users no longer have to rely on a 3rd party package repository. Once hosted, users can consume through the `npm` CLI like so:  
`npm i --save mutation-resolvers-package --registry http://graph-node`  

Or a `graph` CLI command could be added:  
`graph mutations install mutation-resolvers-package`  

## Optimistic Updates
TODO: more research needed  
In short, we'd like to support optimistic updates that are aware of failed resolver execution (ex: transaction failures), and store finality.  

## Graph CLI Updates
`graph mutations codegen` will codegen types from the schema for the mutation resolvers to use (TypeScript, etc).  

`graph init` will add a mutation resolvers package for developers to start implementing from.

## Monitor Status
TODO: more research needed  
In short, we'd like to be able to query the status of a resolver and have granular feedback (custom feedback messages, transactions posted/mined/failed, subgraph ingestion pending, etc).  

## Server Side Execution
Running the mutation resolvers server side, on the graph-node, is beneficial for multiple reasons: implementation updates, no client side web3 connection, non-browser environments, other languages. The client would need to be able to satisfy signature requests from the graph-node when mutations are being executed server side. For running JavaScript mutation resolvers on the server, this could be implemented by wrapping the package in a VM, and having the graph-node act as a proxy between the client and the mutations running in the container:  
1. Client posts mutation query  
2. graph-node forwards request to VM  
3. Resolvers execute in the container  
4. A custom Web3 provider is used in the resolvers, which routes signature requests out of the VM, to the graph-node, to the client, and then back the other way once a signature is given.

# Implementation Path
TODO: more research needed  
For the initial MVP, I think everything can be accomplished by just modifying the `graph-cli` codebase if I'm not mistaken. Details to come once this specification is validated...
