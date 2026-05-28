const DB_URL = 'https://lab7-e4e98-default-rtdb.europe-west1.firebasedatabase.app'

const list = document.getElementById('todo-list')
const itemCountSpan = document.getElementById('item-count')
const uncheckedCountSpan = document.getElementById('unchecked-count')
const loader = document.getElementById('loader')
const errorMsg = document.getElementById('error-msg')

let todos = []

function setLoading(value) {
  if (value) {
    loader.classList.remove('d-none')
  } else {
    loader.classList.add('d-none')
  }
}

function showError(msg) {
  errorMsg.textContent = msg
  errorMsg.classList.remove('d-none')
  setTimeout(function () {
    errorMsg.classList.add('d-none')
  }, 4000)
}

// додавання нової справи в базу (POST)
function addTodo(text) {
  const todo = { text: text, checked: false }

  return fetch(DB_URL + '/todos.json', {
    method: 'POST',
    body: JSON.stringify(todo),
    headers: { 'Content-Type': 'application/json' },
  })
    .then(response => response.json())
    .then(data => {
      // у відповіді приходить { name: "..." }, беремо name як id
      todo.id = data.name
      return todo
    })
}

// читання всіх справ з бази (GET)
function getTodos() {
  return fetch(DB_URL + '/todos.json')
    .then(response => response.json())
    .then(data => {
      const result = []
      if (data) {
        for (let key in data) {
          result.push({
            id: key,
            text: data[key].text,
            checked: data[key].checked,
          })
        }
      }
      return result
    })
}

// видалення справи з бази (DELETE)
function deleteFromDB(id) {
  return fetch(DB_URL + '/todos/' + id + '.json', {
    method: 'DELETE',
  })
}

// оновлення справи в базі (PATCH)
function updateInDB(id, checked) {
  return fetch(DB_URL + '/todos/' + id + '.json', {
    method: 'PATCH',
    body: JSON.stringify({ checked: checked }),
    headers: { 'Content-Type': 'application/json' },
  })
}

function newTodo() {
  const text = prompt('Введіть нове завдання:')
  if (!text) return

  setLoading(true)
  addTodo(text)
    .then(todo => {
      todos.push(todo)
      console.log(todos)
      render(todos)
      updateCounter(todos)
      setLoading(false)
    })
    .catch(err => {
      console.log(err)
      showError('Не вдалося додати завдання')
      setLoading(false)
    })
}

function renderTodo(todo) {
  let spanClass = ''
  let checked = ''
  if (todo.checked) {
    spanClass = 'text-success text-decoration-line-through'
    checked = 'checked'
  }

  return `<li class="list-group-item">
    <input type="checkbox" class="form-check-input me-2" id="${todo.id}" ${checked} onChange="checkTodo('${todo.id}')" />
    <label for="${todo.id}"><span class="${spanClass}">${todo.text}</span></label>
    <button class="btn btn-danger btn-sm float-end" onClick="deleteTodo('${todo.id}')">delete</button>
  </li>`
}

function render(todos) {
  let html = ''
  todos.forEach(todo => {
    html += renderTodo(todo)
  })
  list.innerHTML = html
}

function updateCounter(todos) {
  itemCountSpan.textContent = todos.length
  const unchecked = todos.filter(todo => todo.checked === false)
  uncheckedCountSpan.textContent = unchecked.length
}

function deleteTodo(id) {
  setLoading(true)
  deleteFromDB(id)
    .then(() => {
      todos = todos.filter(todo => todo.id !== id)
      render(todos)
      updateCounter(todos)
      setLoading(false)
    })
    .catch(err => {
      console.log(err)
      showError('Не вдалося видалити завдання')
      setLoading(false)
    })
}

function checkTodo(id) {
  const todo = todos.find(todo => todo.id === id)
  if (!todo) return

  setLoading(true)
  updateInDB(id, !todo.checked)
    .then(() => {
      todo.checked = !todo.checked
      render(todos)
      updateCounter(todos)
      setLoading(false)
    })
    .catch(err => {
      console.log(err)
      showError('Не вдалося оновити завдання')
      setLoading(false)
    })
}

// завантажуємо справи з бази при відкритті сторінки
setLoading(true)
getTodos()
  .then(data => {
    todos = data
    console.log(todos)
    render(todos)
    updateCounter(todos)
    setLoading(false)
  })
  .catch(err => {
    console.log(err)
    showError('Не вдалося завантажити дані')
    setLoading(false)
  })
