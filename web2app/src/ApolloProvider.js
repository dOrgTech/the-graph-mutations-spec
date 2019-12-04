import React from 'react';
import App from './App';
import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider } from '@apollo/react-hooks';
import { generateId } from './util/IdGenerator';
import sleep from './util/sleep';
import {typeDefs} from './graphql/typeDefs';
import {GET_TODOS_QUERY} from './graphql/queries';
import {completeTodo} from './graphql/fragments';
import Transaction from './class/Transaction.class';

const cache = new InMemoryCache();
cache.writeData({
    data: {
        getTodos: []
    }
})

const client = new ApolloClient({
    resolvers: {
        Mutation: {
            create: async (_, { createInput: { asignee, description }, requestId }, {cache, mutationState}) => {
                mutationState.addTransaction(new Transaction("86453"));
                mutationState.findByHash("86453").progress = 33;
                console.log(mutationState.findByHash("86453").progress)
                await sleep(2000);
                mutationState.publish()
                const previous = cache.readQuery({ query: GET_TODOS_QUERY })
                const newTodo = { id: generateId(), completed: false, description, asignee, __typename: 'Todo' }
                mutationState.findByHash("86453").progress = 66;
                console.log(mutationState.findByHash("86453").progress)
                await sleep(2000);
                mutationState.publish()
                const data = { getTodos: [...previous.getTodos, newTodo] };
                cache.writeQuery({ query: GET_TODOS_QUERY, data });
                await sleep(2000);
                mutationState.findByHash("86453").progress = 100;
                console.log(mutationState.findByHash("86453").progress)
                mutationState.publish()
                return newTodo;
            },
            delete: async (_, { id }, { cache }) => {
                const previous = cache.readQuery({ query: GET_TODOS_QUERY })
                const element = previous.getTodos.find((todo) => todo.id === id)
                const data = { getTodos: [...previous.getTodos.filter((todo) => todo.id !== id)] }
                cache.writeQuery({ query: GET_TODOS_QUERY, data })
                return element;
            },
            setComplete: async (_, { id }, {cache, getCacheKey}) => {
                const todoId = getCacheKey({ __typename: 'Todo', id })
                const todo = cache.readFragment({ fragment: completeTodo, id: todoId });
                todo.completed = !todo.completed;
                const data = { ...todo };
                cache.writeData({ id:todoId, data });
                return todo;
            }
        }
    },
    cache,
    typeDefs
})

export default (
    <ApolloProvider client={client}>
        <App />
    </ApolloProvider>
);