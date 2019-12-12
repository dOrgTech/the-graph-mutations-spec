[ ] createMutations
```typescript
const queryLink = createHttpLink({ uri: GRAPHQL_ENDPOINT });
// TODO: move this under the hood
const metadataLink = createHttpLink({ uri: "https://api.thegraph.com/subgraphs" });
const mutations = createMutations({
  mutations: gravatarMutations,
  queryLink: queryLink,
  metadataLink: metadataLink,
  config: {
    ethereum: async () => {
      const { ethereum } = (window as any);

      if (!ethereum) {
        throw Error("Please install metamask");
      }

      await ethereum.enable();
      return ethereum;
    },
    ipfs: IPFS_PROVIDER
  }
  // TODO: use apollo-link-context under the hood
  // TODO: support functions for these getters
  // TODO: note that they'll be called each time
  // TODO: document the concept of config getters, setters, and the fact that "createMutations" acts as the glue
});

const mutationLink = createMutationLink({ mutations })

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === "OperationDefinition" && operation === "mutation"
  },
  mutationLink,
  queryLink
);

const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
})
```
