const addInput = document.querySelector("[data-add-input]");
const addBtn = document.querySelector("[data-add-btn]");
const containerTodos = document.querySelector("[data-container-todos]");
const todoTemplate = document.querySelector("[data-todo-template]");

let todoList = [];

const MOCK_API = "https://69715bdf78fec16a6300b083.mockapi.io/api/users";

async function getTasks() {
    try {
        const response = await fetch(MOCK_API);

        if (!response.ok) {
            throw new Error(`Ошибка ${response.status}`);
        }

        const data = await response.json();
        todoList = data;

        render();
    } catch (error) {
        console.error("Ошибка при получении задач")
    }
}

async function updateTask(task, completed) {
    const response = await fetch(`${MOCK_API}/${task.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...task, completed: completed }),
        headers: {
            "Content-type": "application/json"
        }
    })

    const data = await response.json();


}

async function deleteTask(task) {
    const response = await fetch(`${MOCK_API}/${task.id}`, {
        method: "DELETE"
    })

    const data = await response.json();

    todoList = todoList.filter(t => t.id !== data.id);

    render();
}

async function createNewTask(task) {
    try {
        const response = await fetch(MOCK_API, {
            method: "POST",
            body: JSON.stringify({
                text: task,
                completed: false,
                createdAt: new Date(),
            }),
            headers: {
                "Content-type": "application/json"
            }
        })

        if (!response.ok) {
            throw new Error(`Ошибка ${response.status}`)
        }

        const data = await response.json();

        todoList.push(data);
        render();
    } catch (error) {
        console.error("Ошибка при создании новой задачи")
    }
}

addBtn.addEventListener("click", () => {
    if (addInput.value.trim()) {
        createNewTask(addInput.value);
        addInput.value = "";
    }
})

function createdTodoLayout(todo) {
    const todoElement = document.importNode(todoTemplate.content, true);

    const checkbox = todoElement.querySelector("[data-todo-checkbox]");
    checkbox.checked = todo.completed;

    const todoText = todoElement.querySelector("[data-todo-text]");
    todoText.textContent = todo.text;

    const todoDate = todoElement.querySelector("[data-todo-date]");
    todoDate.textContent = todo.createdAt;

    const removeBtn = todoElement.querySelector("[data-remove-btn]");
    removeBtn.disabled = !todo.completed;

    checkbox.addEventListener("change", (e) => {
        todoList = todoList.map(t => t.id === todo.id ? { ...t, completed: e.target.checked } : t);

        render();
        updateTask(todo, e.target.checked);
    })

    removeBtn.addEventListener("click", () => {
        deleteTask(todo);
    })

    return todoElement;
}

function render() {
    containerTodos.innerHTML = "";
    todoList.forEach(todo => {
        const todoElement = createdTodoLayout(todo);

        containerTodos.append(todoElement);
    })
}

getTasks();