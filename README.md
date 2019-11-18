# **The Graph - Mutation Support**
This document starts with the "Gravatars" example project, and walks through the steps a developer would take to add Mutations to the subgraph and dApp.    

Original source available here:  
[`./subgraph`](./subgraph): https://github.com/graphprotocol/example-subgraph  
[`./dapp`](./dapp): https://github.com/graphprotocol/ethdenver-dapp  

# User Story: Protocol Developer

Starting in the [./subgraph](./subgraph) folder...

## Step 1: Mutation Schema & Manifest Files

[`mutations/schema.graphql`](./subgraph/src/mutations/schema.graphql)
```graphql
input GravatarOptions {
  displayName: String!
  imageUrl: String!
}

type Mutation {
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

**NOTE:** GraphQL types from the subgraph's [schema.graphql](./subgraph/schema.graphql) are automatically included in this file.

[`mutations.yaml`](./subgraph/mutations/mutations.yaml)
```yaml
specVersion: 0.0.1
repository: https://npmjs.com/package/gravatar-mutations
mutations:
  schema:
    file: ./schema.graphql
  resolvers:
    kind: javascript
    file: ./dist/index.js
```

### Decisions Made
**Define Mutations In GraphQL:**  
Keeping everything in GraphQL...
* Promotes consistency and predictability for how types will be bound to the resolver's implementation language, since this standard is already defined for us by existing GraphQL tooling.
* Allows you to both define new data types (for example `input GravatarOptions`) and use existing entity types (for example `Gravatar`) within your mutation definitions.

**Define Mutations In a Separate GraphQL & YAML File:**  
The following thoughts played a role in this decision...
* In order to promote the decoupling of codebases (subgraph mappings & mutations), defining the mutations in separate GraphQL & YAML files is desired.
* Helps keep write-specific data types separate from the main schema of the subgraph's entity store. To illustrate this, see "GravatarOptions" in the example above. We'd like to keep these types out of the main schema file.
* Ideally developers could publish mutations for pre-existing subgraphs, without having to modify the root manifest.

**Multiple `kind`s of Mutation Resolvers:**  
In the future, we may want to support resolvers that are compiled to WASM.  

**Server-Side == Client-Side Resolvers:**  
Originally, I had "`kind: browser/javascript`", but realized that (1) Apollo GraphQL resolvers have the same signature client-side as they do server-side, and (2) implementing server-side resolvers within graph-node could (and should) be done in a way that doesn't require any code changes from the mutation developer (see "Post MVP Goals" section below).

## Step 2: Add Mutations To Subgraph Manifest

[`subgraph.yaml`](./subgraph/subgraph.yaml)
```yaml
specVersion: 0.0.3
...
schema:
  file: ./schema.graphql
mutations:
  file: ./mutations/mutations.yaml
dataSources:
  - ...
```

## Step 3: Implement The Mutations Resolvers (Javascript)

[`index.js`](./subgraph/src/mutations/src/index.js)
```js
const resolvers = {
  Mutation: {
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

const requiredContext = {
  ethereum: (provider) => {
    // setWeb3Provider(provider)
  },
  ipfs: (provider) => {
    // setIPFSProvider(provider)
  }
}

export default {
  resolvers,
  requiredContext
}
```

The requirements for the [JavaScript Module](./subgraph/src/mutations/package.json) are:
1. Include a root module within the [package.json](./subgraph/src/mutations/package.json)  
  `"main": "./path/to/index.js"`
2. The [root module](./subgraph/src/mutations/src/index.js) exports a `resolvers` object, which defines all mutations (see example below).  
3. The [root module](./subgraph/src/mutations/src/index.js) exports a `setWeb3Provider(provider)` method, which is assumed to set the Web3 Provider for the resolvers to use.  

**ES5 Compliant JS:** The javascript `file` that's referenced will be a ES5 compatible, monolithic module. ES5 is to ensure it works in a wide range of browsers, and the server's javascript environment. Monolithic file is to ensure the developer doesn't expect any post publishing build steps like `npm i`. If developers would like to also supply their users an option to download from a 3rd party repository like npmjs.com or github.com, they can include that link in the `repository` section of the manifest. This is useful if they'd like to give developers an un-minimized version of the source for debugging or auditing.

https://github.com/dollarshaveclub/es-check

### Decisions Made
**Require A "Set Web3 Provider" Function:** The state of client-side Web3 wallets is always changing, and I do not think we should leave it up to the mutation developer to be able to future proof their implementations. In order to remedy this, a simple setter is a good compromise in my opinion. This also helps in the server-side mutations implementation path (see "Post MVP Goals" section below). The setter function as it exists now is a singleton pattern, and I'd like to find a way to have it be instance based to support multiple providers, the same way `ApolloClient` is an instance based approach.

## Step 5: Build & Publish Subgraph

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