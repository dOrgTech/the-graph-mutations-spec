const {ApolloServer} = require('apollo-server');
const {PubSub} = require("apollo-server");
const gql = require('graphql-tag')
const mongoose = require('mongoose');
const {MONGODB}= require('./config');

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers')
const pubsub = new PubSub();

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req, res}) => ({ req, res, pubsub })
})

mongoose.connect(MONGODB, { useNewUrlParser: true })
    .then(()=>{
        return server.listen({port: 5000});
    })
    .then(res => {console.log(`Server running at ${res.url}`)});