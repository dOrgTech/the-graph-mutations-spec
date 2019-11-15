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
        async create(parent, { createInput: { asignee, description }}) {
            console.log("asignee, description")
            const newTodo = new Todo({
                asignee,
                description,
                completed: false
            })
            const res = await newTodo.save();
            return {
                ...res._doc,
                id: res._id
            }
        },
        async setComplete(parent, {id}){
            const res = await Todo.findByIdAndUpdate(id, {completed: true}, {new: true});
            return {
                ...res._doc,
                id: res._id
            }
        },
        async setIncomplete(parent, {id}){
            const res = await Todo.findByIdAndUpdate(id, {completed: false}, {new: true});
            return {
                ...res._doc,
                id: res._id
            }
        },
        async delete(parent, {id}){
            const todo = await Todo.findById(id);
            
            await Todo.deleteOne({_id:todo._id});
            return todo
        }

    }
}