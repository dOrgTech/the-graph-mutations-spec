import ApolloClient from 'apollo-client'
import gql from 'graphql-tag'
import {
  InMemoryCache,
  NormalizedCacheObject
} from 'apollo-cache-inmemory'
import 'cross-fetch/polyfill'

import {
  createMutations,
  createMutationsLink,
  MutationStates,
  CoreState,
  Mutations,
  MutationContext
} from '../'
import {
  MutationStatesSub
} from '../mutationState'

const resolvers = {
  Mutation: {
    testResolve: async () => {
      return true
    },
    secondTestResolve: async () => {
      return true
    },
    testConfig: async (_, __, context: MutationContext<Config>) => {
      return context.graph.config.value
    }
  }
}

type Config = typeof config
const config = {
  value: (arg: string) => arg
}

describe("Mutations package - CreateMutations", () => {

  let client: ApolloClient<NormalizedCacheObject>
  let mutations: Mutations<Config>
  let observer = new MutationStatesSub({ } as MutationStates<CoreState>)
  let latestState: MutationStates<CoreState> = {}

  beforeAll(() => {
    mutations = createMutations({
      mutations: {
        resolvers,
        config
      },
      subgraph: '',
      node: '',
      config: {
        value: "..."
      }
    })

    const mutationLink = createMutationsLink({ mutations })
    
    client = new ApolloClient({
      link: mutationLink,
      cache: new InMemoryCache()
    })

    observer.subscribe((value: MutationStates<CoreState>) => {
      latestState = value
    })
  })

  it("Successfully creates mutations, link and executes mutations with it. No observer provided", async () => {
    const { data }  = await client.mutate({
      mutation: gql`
        mutation testResolve {
            testResolve @client
        }
      `
    })

    expect(data.testResolve).toEqual(true)
  })

  it("Correctly wraps resolvers and formats observer results to object with mutation name as key and state as value", async () => {
    await client.mutate({
      mutation: gql`
        mutation testResolve {
            testResolve @client
        }
      `,
      context: {
        graph: {
          _rootSub: observer
        }
      }
    })

    expect(latestState).toHaveProperty("testResolve")
    expect(latestState.testResolve.events).toBeTruthy()
  })

  it("Executes multiple mutations in the same mutation query and dispatches object with different states for each", async () => {
    await client.mutate({
      mutation: gql`
        mutation testResolve {
            testResolve @client
            secondTestResolve @client
        }
      `,
      context: {
        graph: {
          _rootSub: observer
        }
      }
    })

    expect(latestState).toHaveProperty("testResolve")
    expect(latestState.testResolve.events).toBeTruthy()

    expect(latestState).toHaveProperty("secondTestResolve")
    expect(latestState.secondTestResolve.events).toBeTruthy()

    expect(latestState.testResolve).not.toEqual(latestState.secondTestResolve)
  })

  it("Executes the same mutation several times in the same query and dispatches object with different states for each", async () => {
    await client.mutate({
      mutation: gql`
        mutation testResolve {
            testResolve @client
            testResolve @client
        }
      `,
      context: {
        graph: {
          _rootSub: observer
        }
      }
    })

    expect(latestState).toHaveProperty("testResolve_1")
    expect(latestState.testResolve_1.events).toBeTruthy()

    expect(latestState).toHaveProperty("testResolve_2")
    expect(latestState.testResolve_2.events).toBeTruthy()

    expect(latestState.testResolve_1).not.toEqual(latestState.testResolve_2)
  })

  it("Correctly executes mutation without ApolloLink", async () => {
    let context = { } as MutationContext<Config>

    const { data } = await mutations.execute({
      query: gql`
        mutation testResolve {
            testResolve @client
        }
      `,
      variables: { },
      operationName: 'mutation',
      getContext: () => context,
      setContext: (newContext: MutationContext<Config>) => {
        context = newContext
        return context
      }
    })

    expect(data.testResolve).toEqual(true)
  })

  it("Correctly reconfigures the mutation module", async () => {
    {
      const { data }  = await client.mutate({
        mutation: gql`
          mutation testConfig {
            testConfig @client
          }
        `
      })

      expect(data.testConfig).toEqual("...")
    }

    await mutations.configure({
      value: "foo"
    })

    {
      const { data }  = await client.mutate({
        mutation: gql`
          mutation testConfig {
            testConfig @client
          }
        `
      })

      expect(data.testConfig).toEqual("foo")
    }
  })

  it("Detects incorrect configuration values object", async () => {
    try {
      mutations.configure({ notValues: "" } as any)
      throw Error("This should never happen...")
    } catch (e) { }
  })

  it("Detects incorrect configuration generator objects", async () => {

    // Generator isn't a function
    try {
      createMutations({
        mutations: {
          resolvers,
          config: { value: true } as any
        },
        subgraph: '',
        node: '',
        config: { value: true }
      })
      throw Error("This should never happen...")
    } catch (e) {
      expect(e.message).toBe(`Generator must be of type 'object' or 'function'`)
    }

    // Nested generator isn't a function
    try {
      createMutations({
        mutations: {
          resolvers,
          config: { something: { } } as any
        },
        subgraph: '',
        node: '',
        config: { something: { } }
      })
      throw Error("This should never happen...")
    } catch (e) {
      expect(e.message).toBe('Config Generators must be a function, or an object that contains functions.')
    }

    // Argument doesn't exist
    try {
      createMutations({
        mutations: {
          resolvers,
          config
        },
        subgraph: '',
        node: '',
        config: { } as any
      })
      throw Error("This should never happen...")
    } catch (e) {
      expect(e.message).toBe(`Failed to find mutation configuration value for the property 'value'.`)
    }

    // Nested argument doesn't exist
    try {
      createMutations({
        mutations: {
          resolvers,
          config: { something: { value: (value: string) => value } } as any
        },
        subgraph: '',
        node: '',
        config: { something: { } } as any
      })
      throw Error("This should never happen...")
    } catch (e) {
      expect(e.message).toBe(`Failed to find mutation configuration value for the property 'value'.`)
    }

    // Config generators must take one argument
    try {
      createMutations({
        mutations: {
          resolvers,
          config: { something: () => "" } as any
        },
        subgraph: '',
        node: '',
        config: { something: "" } as any
      })
      throw Error("This should never happen...")
    } catch (e) {
      expect(e.message).toBe('Config Generators must take 1 argument')
    }
  })

  // TODO:
  /*
    - config should be optionally an empty object
    - query with different `mutation Name` and make sure that isn't the state name that's used
    - no @client directive
    - hide private context values
    - all external types don't require state & eventmap (update example)
    - - why does it matter to the caller who's maintaining the context what config is? could it just be an any type?
    - test vanilla useMutation & <Mutation />
    - is state type safe when you consume
  */
})
