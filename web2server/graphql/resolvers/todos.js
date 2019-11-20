const Todo = require('../../models/Todo');
const {withFilter} = require('apollo-server');
const {NEW_TODO} = require("../events/constants");

module.exports = {
    Query: {
        async getTodos() {
            try {
                const todos = await Todo.find();
                return todos;
            } catch (err) {
                throw new Error(err);
            }
        }
    },
    Mutation: {
        async create(_, { createInput: { asignee, description }, requestId: id }, {pubsub}, info ) {
            const newTodo = new Todo({
                asignee,
                description,
                completed: false
            })
            await sleep(3000);
            pubsub.publish(NEW_TODO, {progress: 33, requestId: id});
            await sleep(3000);
            pubsub.publish(NEW_TODO, {progress: 66, requestId: id});
            await sleep(10000)
            pubsub.publish(NEW_TODO, {progress: 100, requestId: id});
            const res = await newTodo.save();
            return {
                ...res._doc,
                id: res._id
            }
        },
        async setComplete(_, { id }) {
            await sleep(10000);
            const res = await Todo.findByIdAndUpdate(id, { completed: true }, { new: true });
            return {
                ...res._doc,
                id: res._id
            }
        },
        async setIncomplete(_, { id }) {
            await sleep(10000);
            const res = await Todo.findByIdAndUpdate(id, { completed: false }, { new: true });
            return {
                ...res._doc,
                id: res._id
            }
        },
        async delete(_, { id }) {
            const todo = await Todo.findById(id);
            await Todo.deleteOne({ _id: todo._id });
            return todo
        }
    },
    Subscription: {
        progress: {
            subscribe: withFilter(
                (_, __, {pubsub}) => pubsub.asyncIterator(NEW_TODO),
                (payload, args) => payload.requestId === args.requestId
            )
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}