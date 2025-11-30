import { useState } from 'react'
import './App.css'
import { createTodo, deleteTodo, getAllTodos, updateTodo, type NewTodo, type Todo } from './action'
import React from 'react'

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState<string>("");

  async function loadTodos() {
    try {
      const todoData = await getAllTodos();
      setTodos(todoData);
    } catch (err) {
      console.error("Erreur lors du chargement des tâches :", err);
    }
  }

  async function submitNewTodo() {
    await createTodo({ title });
    loadTodos();
  }

  async function deleteTodoById(id: string) {
    await deleteTodo(id);
    loadTodos();
  }

  async function updateTodoById(id: string, todo: NewTodo) {
    await updateTodo(id, todo);
    loadTodos();
  }

  React.useEffect(() => {
    loadTodos();
  }, []);

  return (
    <>
      <div>
        <h1>Create</h1>
        <form onSubmit={(e) => { e.preventDefault(); submitNewTodo(); }}>
          <input type="text" name="title" placeholder="Todo Title" onChange={(e) => setTitle(e.target.value)} />
          <button type='submit'>create</button>
        </form>
      </div>
      <div>
        <h1>Todos</h1>
        <ul>
          {todos.map((todo) => (
            <li key={todo._id}>
              <div className='todo'>
                <h2 className='todoName'>{todo.title}</h2>
                {todo.completed ? (<span>DONE</span>) : (<span>NOT DONE</span>)}
                <div className='actions'>
                  <button onClick={() => updateTodoById(todo._id, { ...todo, completed: !todo.completed })}>switch</button>
                  <button onClick={() => deleteTodoById(todo._id)}>delete</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default App
