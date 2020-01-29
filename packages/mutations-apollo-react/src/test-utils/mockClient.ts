import { InMemoryCache } from 'apollo-cache-inmemory'
import ApolloClient from 'apollo-client'
import { typeDefs } from './typedefs'
import { GET_TODOS_QUERY } from './queries'

const cache = new InMemoryCache();
cache.writeData({
    data: {
        getTodos: []
    }
})

export const statesToPublish = ["First", "Second", "Third"]

export const client = new ApolloClient({
    resolvers: {
      Mutation: {
          create: async (_, { createInput: { asignee, description } }, context) => {
            const cache = context.cache
            context.graph.__stateObserver.next(statesToPublish[0])
            const previous = cache.readQuery({ query: GET_TODOS_QUERY })
            const newTodo = { id: Math.random(), completed: false, description, asignee, __typename: 'Todo' }
            const data = { getTodos: [...previous.getTodos, newTodo] };
            context.graph.__stateObserver.next(statesToPublish[1])
            cache.writeQuery({ query: GET_TODOS_QUERY, data });
            context.graph.__stateObserver.next(statesToPublish[2])
            return newTodo;
        }
      }
    },
    cache,
    typeDefs
})