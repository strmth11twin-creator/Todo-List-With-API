const addInput = document.querySelector("[data-add-input]");
const addBtn = document.querySelector("[data-add-btn]");
const containerTodos = document.querySelector("[data-container-todos]");
const todoTemplate = document.querySelector("[data-todo-template]");
const body = document.querySelector("[data-body]");
const changeBtn = document.querySelector("[data-change-btn]");
const searchInput = document.querySelector("[data-search-input]");
const navigationList = document.querySelector("[data-navigation-list]");
const listItem = document.querySelectorAll(".navigation_list--item");
const todoImportant = document.querySelector("[data-todo-important]");
const select = document.querySelector("[data-important-select]");
const allSelectedBtn = document.querySelector("[data-selected-all-btn]");
const allDeleteBtn = document.querySelector("[data-delete-all-btn]");

const allCount = document.querySelector("[data-all-count]");
const activeCount = document.querySelector("[data-active-count]");
const completedCount = document.querySelector("[data-completed-count]");

let todoList = JSON.parse(localStorage.getItem("todos")) || [];
let filterList = [];
let current = "all";

if(localStorage.getItem("stage") === "day") {
    body.classList.remove("dark");
    changeBtn.textContent = "🌛";
} else if(localStorage.getItem("stage") === "night") {
    body.classList.add("dark");
    changeBtn.textContent = "🌞";
}

function saveToLocalStorage(list) {
    localStorage.setItem("todos", JSON.stringify(list));
}

addBtn.addEventListener("click", () => {
    if(addInput.value.trim()) {
        const newTodo = {
            id: Date.now(),
            text: addInput.value,
            completed: false,
            createdAt: dateRepresentation(new Date()),
            important: select.value,
        }

        todoList.push(newTodo);
        addInput.value = "";

        updateCounts();
        saveToLocalStorage(todoList);
        render();
    }
})

containerTodos.addEventListener("dblclick", (e) => {
    if(!e.target.classList.contains("todo-text")) return;

    const input = document.createElement("input");
    input.classList.add("redactor-input");

    const id = Number(e.target.closest("[data-id]").dataset.id);

    e.target.replaceWith(input);
    input.value = e.target.textContent;

    input.focus();

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            input.blur();
        }
    })

    input.addEventListener("blur", () => {
            todoList = todoList.map(t => t.id === id ? { ...t, text: input.value } : t)

            if (searchInput.value.trim()) {
                renderAndRenderFilteredTodos(searchInput.value.trim());
            } else {
                render();
            }

            saveToLocalStorage(todoList);
    })
})

addInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter") {
        addBtn.click();
    }
})

allSelectedBtn.addEventListener("click", (e) => {
    const check = todoList.some(t => !t.completed);

    todoList = todoList.map(t => check ? { ...t, completed: true } : { ...t, completed: false });

    updateCounts();

    if (searchInput.value.trim()) {
        renderAndRenderFilteredTodos(searchInput.value.trim());
    } else {
        render();
    }

    saveToLocalStorage(todoList);
})

allDeleteBtn.addEventListener("click", (e) => {
    todoList = todoList.filter(t => !t.completed)

    updateCounts();

    if (searchInput.value.trim()) {
        renderAndRenderFilteredTodos(searchInput.value.trim());
    } else {
        render();
    }

    saveToLocalStorage(todoList);
})

changeBtn.addEventListener("click", () => {
    if (changeBtn.textContent === "🌛") {
        body.classList.add("dark");
        changeBtn.textContent = "🌞"
    } else {
        body.classList.remove("dark")
        changeBtn.textContent = "🌛"
    }

    changeBtn.textContent === "🌛" ? localStorage.setItem("stage", "day") : localStorage.setItem("stage", "night")
})

function updateCounts() {
    allCount.textContent = todoList.length;
    activeCount.textContent = todoList.filter(t => !t.completed).length;
    completedCount.textContent = todoList.filter(t => t.completed).length;
}

searchInput.addEventListener("input", (e) => {
    const searchValue = e.target.value.trim();

    renderAndRenderFilteredTodos(searchValue);
})

function renderAndRenderFilteredTodos(searchValue) {
    filterList = todoList.filter(t => t.text.toLowerCase().includes(searchValue.toLowerCase()));

    renderFiltered();
}

navigationList.addEventListener("click", (e) => {
    if (!e.target.classList.contains("navigation_list--item")) return;

    listItem.forEach(t => t.classList.remove("active"));

    e.target.classList.add("active");

    current = e.target.dataset.filter

    if (searchInput.value.trim()) {
        renderAndRenderFilteredTodos(searchInput.value.trim());
    } else {
        render();
    }
})

function circkl(important) {
    if (important === "Низкий") return "🟢 Низкий";
    if (important === "Средний") return "🟡 Средний";
    if (important === "Высокий") return "🔴 Высокий"
}

function dateRepresentation(newCreatedDate) {
    return Intl.DateTimeFormat("UZ-uz", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
    }).format(newCreatedDate);
}

function createdTodoLayout(todo) {
    const todoElement = document.importNode(todoTemplate.content, true);

    const id = todoElement.querySelector("[data-todo-id]");
    id.dataset.id = todo.id;

    const checkbox = todoElement.querySelector("[data-todo-checkbox]");
    checkbox.checked = todo.completed;

    const todoText = todoElement.querySelector("[data-todo-text]");
    todoText.textContent = todo.text;

    const todoDate = todoElement.querySelector("[data-todo-date]");
    todoDate.textContent = todo.createdAt;

    const removeBtn = todoElement.querySelector("[data-remove-btn]");
    removeBtn.disabled = !todo.completed;

    const todoImportant = todoElement.querySelector("[data-todo-important]");
    todoImportant.textContent = circkl(todo.important);

    checkbox.addEventListener("change", (e) => {
        todoList = todoList.map(t => t.id === todo.id ? { ...t, completed: e.target.checked } : t);

        updateCounts();
        saveToLocalStorage(todoList);

        if (searchInput.value.trim()) {
            renderAndRenderFilteredTodos(searchInput.value.trim());
        } else {
            render();
        }
    })

    removeBtn.addEventListener("click", () => {
        todoList = todoList.filter(t => t.id !== todo.id);

        updateCounts();
        saveToLocalStorage(todoList);

        if (searchInput.value.trim()) {
            renderAndRenderFilteredTodos(searchInput.value.trim());
        } else {
            render();
        }
    })

    return todoElement;
}

function render() {
    containerTodos.innerHTML = "";

    filteredList = todoList;

    if(current === "active") {
        filteredList = todoList.filter(t => !t.completed);
    }

    if(current === "completed") {
        filteredList = todoList.filter(t => t.completed);
    }

    if(todoList.length === 0) {
        containerTodos.innerHTML  = "<h3>Нет задач...</h3>"
    }

    filteredList.forEach(todo => {
        const todoElement = createdTodoLayout(todo);

        containerTodos.append(todoElement);
    })
}

function renderFiltered() {
    containerTodos.innerHTML = "";

    filteredList = filterList

    if (current === "active") {
        filteredList = filterList.filter(t => !t.completed);
    }

    if (current === "completed") {
        filteredList = filterList.filter(t => t.completed);
    }

    if (filterList.length === 0) {
        containerTodos.innerHTML = "<h3>Нет найденных задач...</h3>"
    }

    filteredList.forEach(todo => {
        const todoElement = createdTodoLayout(todo);

        containerTodos.append(todoElement);
    })
}

updateCounts();
render();