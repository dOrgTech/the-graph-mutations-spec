import { InMemoryCache } from 'apollo-cache-inmemory'
import ApolloClient from 'apollo-client'
import { typeDefs } from './typedefs'

const cache = new InMemoryCache();
cache.writeData({
    data: {
        getTodos: []
    }
})

export const statesToPublish = [{ testResolve: "First"}, { testResolve: "Second"}, { testResolve: "Third"}]

export const client = new ApolloClient({
    resolvers: {
      Mutation: {
          testResolve: async (_, __, context) => {
            if(!context.graph || !context.graph.__stateObserver){
              return false;
            }
            context.graph.__stateObserver.next(statesToPublish[0])
            context.graph.__stateObserver.next(statesToPublish[1])
            context.graph.__stateObserver.next(statesToPublish[2])
            return true;
        }
      }
    },
    cache,
    typeDefs
})