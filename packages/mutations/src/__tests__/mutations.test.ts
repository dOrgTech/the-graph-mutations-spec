import ApolloClient from 'apollo-client'
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { BehaviorSubject } from 'rxjs'
import 'cross-fetch/polyfill';

import { createMutations, createMutationsLink } from '..'
import { MutationStates, CoreState } from '../mutationState'
import gql from 'graphql-tag';

const resolvers = {
  Mutation: {
    testResolve: async () => {
      return true;
    },
    secondTestResolve: async () => {
      return true;
    }
  }
}

describe("Mutations package - CreateMutations", () => {

  let client: ApolloClient<NormalizedCacheObject>
  let observer = new BehaviorSubject({ } as MutationStates<CoreState>)
  let latestState: MutationStates<CoreState> = {}

  beforeAll(() => {
    const mutations = createMutations({
      mutations: {
        resolvers,
        config: { }
      },
      subgraph: '',
      node: '',
      config: { }
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
})