# Build Step
`graph build`
- Finds & Builds subgraph.yaml
-- if (mutations) -> build mutations.yaml
- Finds mutations.yaml -> build mutation.yaml

- The Graph Notes
Changes:
* host package on IPFS instead of graph-node
* in app, create Graph Protocol context object instead of setWeb3Provider
* Add notes on the query engine to the post MVP goals
* query datasources from the manifest
* ES5 sanitization


Open question:
* return value within graphql too limiting? how can we tell the caller the status of multiple transactions (for eample) 
  * wrapper return value (status, finality value)
* JS package concern: Dynamic loading JS can be troublesome and undeterministic. WASM might be a good alternative, but defining the runtime APIs for the WASM module would be a whole new thing.
  * figma for sandboxed JS?
https://www.figma.com/blog/how-we-built-the-figma-plugin-system/


Questions:
* mutation developer gets the providers from graphprotocol. We want to give the app developer full reign over making the provider decision no? We would still then have a setProvider function that's in the graphProtocol package. Also I don't think the mutation should care about network, as it can get that from the provider. Who should have the "final" say? Who will be unhappy with that?
