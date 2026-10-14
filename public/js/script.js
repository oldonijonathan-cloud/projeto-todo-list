// ===== Elementos da página =====
const form = document.querySelector('.new-todo');
const input = document.querySelector('#new-todo-input');
const list = document.querySelector('.todo-list');
const count = document.querySelector('.count');
const filterLinks = document.querySelectorAll('.filter a');
const clearButton = document.querySelector('.clear-completed');
const themeButton = document.querySelector('.darkmode-toggle');

// ===== Dados =====
// Tarefas iniciais (usadas só na primeira visita)
const defaultTodos = [
    { id: 1, text: 'Ler 10 páginas de um livro', done: false },
    { id: 2, text: 'Meditar', done: true },
    { id: 3, text: 'Editar dois vídeos', done: false },
    { id: 4, text: 'Criar portfólio', done: false },
    { id: 5, text: 'Academia', done: false },
];

// Lê do localStorage com segurança (pode falhar em aba anônima)
function load(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch {
        return fallback;
    }
}

function save(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Se não der para salvar, a lista continua funcionando na tela
    }
}

let todos = load('todos', defaultTodos);
let filter = location.hash || '#todos';

// ===== Mostrar a lista na tela =====
function render() {
    list.innerHTML = '';

    const visible = todos.filter(function (todo) {
        if (filter === '#ativos') return !todo.done;
        if (filter === '#concluidos') return todo.done;
        return true;
    });

    visible.forEach(function (todo) {
        const li = document.createElement('li');
        li.className = 'item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'todo-' + todo.id;
        checkbox.checked = todo.done;
        checkbox.addEventListener('change', function () {
            todo.done = checkbox.checked;
            update();
        });

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = todo.text; // textContent evita que HTML digitado vire código

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'delete';
        deleteButton.setAttribute('aria-label', 'Excluir tarefa');
        deleteButton.textContent = '×';
        deleteButton.addEventListener('click', function () {
            todos = todos.filter(function (t) { return t.id !== todo.id; });
            update();
        });

        li.append(checkbox, label, deleteButton);
        list.append(li);
    });

    // Contador de itens restantes (singular/plural)
    const remaining = todos.filter(function (todo) { return !todo.done; }).length;
    count.textContent = remaining + (remaining === 1 ? ' item restante' : ' itens restantes');

    // Destaca o filtro ativo
    filterLinks.forEach(function (link) {
        link.classList.toggle('active', link.getAttribute('href') === filter);
    });
}

// Salva e redesenha
function update() {
    save('todos', todos);
    render();
}

// ===== Adicionar tarefa =====
form.addEventListener('submit', function (event) {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    todos.push({ id: Date.now(), text: text, done: false });
    input.value = '';
    update();
});

// ===== Filtros (Todos / Ativos / Concluídos) =====
window.addEventListener('hashchange', function () {
    filter = location.hash || '#todos';
    render();
});

// ===== Limpar concluídos =====
clearButton.addEventListener('click', function () {
    todos = todos.filter(function (todo) { return !todo.done; });
    update();
});

// ===== Tema claro/escuro =====
if (load('theme', 'dark') === 'light') {
    document.body.classList.remove('darkmode');
}

themeButton.addEventListener('click', function () {
    const isDark = document.body.classList.toggle('darkmode');
    save('theme', isDark ? 'dark' : 'light');
});

render();
