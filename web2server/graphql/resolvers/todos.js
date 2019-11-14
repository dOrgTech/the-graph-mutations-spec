const Todo = require('../../models/Todo');

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
        async create(parent, { createInput: { asignee, description, completed }}) {
            const newTodo = new Todo({
                asignee,
                description,
                completed
            })
            const res = await newTodo.save();
            return {
                ...res._doc,
                id: res._id
            }
        },
        async complete(parent, {id}){
            const res = await Todo.findOneAndUpdate(id, {completed: true});
            return {
                ...res._doc,
                id: res._id
            }
        }

    }
}