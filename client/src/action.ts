export interface Todo {
    _id: string
    title: string
    completed: boolean
}

export interface NewTodo {
    title: string
    completed?: boolean
}

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const TODO_ENDPOINT = `${API_BASE_URL}/api/v1/todos`

export async function getAllTodos(): Promise<Todo[]> {
    try {
        const response = await fetch(TODO_ENDPOINT)

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(
                `Failed to fetch todos: ${response.status} - ${errorText}`,
            )
        }

        const data: Todo[] = await response.json()
        return data
    } catch (error) {
        console.error('API Error in getAllTodos:', error)
        throw error
    }
}

export async function createTodo(newTodo: NewTodo): Promise<Todo> {
    try {
        const response = await fetch(TODO_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newTodo),
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(
                `Failed to create todo: ${response.status} - ${errorText}`,
            )
        }

        const createdTodo: Todo = await response.json()
        return createdTodo
    } catch (error) {
        console.error('API Error in createTodo:', error)
        throw error
    }
}

export async function deleteTodo(id: string): Promise<void> {
    const deleteUrl = `${TODO_ENDPOINT}/${id}`

    try {
        const response = await fetch(deleteUrl, {
            method: 'DELETE',
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(
                `Failed to delete todo ${id}: ${response.status} - ${errorText}`,
            )
        }

        console.log(`Successfully deleted todo with ID: ${id}`)
    } catch (error) {
        console.error('API Error in deleteTodo:', error)
        throw error
    }
}

export async function updateTodo(id: string, updateData: NewTodo): Promise<Todo> {
    const updateUrl = `${TODO_ENDPOINT}/${id}`

    try {
        const response = await fetch(updateUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(
                `Failed to update todo ${id}: ${response.status} - ${errorText}`,
            )
        }

        const updatedTodo: Todo = await response.json()
        return updatedTodo
    } catch (error) {
        console.error('API Error in updateTodo:', error)
        throw error
    }
}
