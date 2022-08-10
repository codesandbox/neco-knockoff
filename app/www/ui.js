import { createApp } from 'https://unpkg.com/petite-vue?module'

const STORAGE_KEY = 'todos-petite-vue'
const stateStorage = {
  async init() {
    //const todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    const stateResult = await fetch('/state')
    const state = await stateResult.json()
    //todos.forEach((todo, index) => {
    //  todo.id = index
    //})
    stateStorage.uid = state.todos.length
    stateStorage.todos = state.todos
    stateStorage.events = state.events
  },
  save(todos) {
    //localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }
}

const filters = {
  all(todos) {
    return todos
  },
  active(todos) {
    return todos.filter((todo) => {
      return !todo.completed
    })
  },
  completed(todos) {
    return todos.filter(function (todo) {
      return todo.completed
    })
  }
}

createApp({
  todos: [],
  events: [],
  newTodo: '',
  editedTodo: null,
  visibility: 'all',
  deploying: false,

  get filteredTodos() {
    return filters[this.visibility](this.todos)
  },

  get remaining() {
    return filters.active(this.todos).length
  },

  get allDone() {
    return this.remaining === 0
  },

  set allDone(value) {
    this.todos.forEach(function (todo) {
      todo.completed = value
    })
  },

  get eventLog() {
    const eventlog = []
    for (const [i,e] of JSON.parse(JSON.stringify(this.events)).entries()) {
      eventlog.unshift({
        ...e,
        id: i
      })
    }
    return eventlog
  },

  save() {
    stateStorage.save(this.todos)
  },

  async setup() {
    // Set up filter routing
    const onHashChange = () => {
      var visibility = window.location.hash.replace(/#\/?/, '')
      if (filters[visibility]) {
        this.visibility = visibility
      } else {
        window.location.hash = ''
        this.visibility = 'all'
      }
    }

    window.addEventListener('hashchange', onHashChange)
    onHashChange()

    // Fetch todos from API
    await stateStorage.init()
    this.todos = stateStorage.todos
    this.events = stateStorage.events

    console.log('stateStorage initialized:', stateStorage)

    // On save, update the runnable
    self.MonacoEnvironment = self.MonacoEnvironment || {}
    MonacoEnvironment.saveAction = (ed) => {
      if (this.deploying) {
        alert('Please wait for the current deploy to finish!')
      } else {
        // This refers to the component's scope in an => function
        this.deploy(ed)
      }
    }
  },

  // TODO: doneTodo() is just vue-model-ed into todo.completed (no event)

  addTodo() {
    var value = this.newTodo && this.newTodo.trim()
    if (!value) {
      return
    }
    this.todos.push({
      id: stateStorage.uid++,
      title: value,
      completed: false
    })
    this.newTodo = ''

    this.evt({
      type: 'add',
      task: this.todos[this.todos.length-1]
    })
  },

  removeTodo(todo) {
    this.todos.splice(this.todos.indexOf(todo), 1)

    this.evt({
      type: 'del',
      task: todo
    })
  },

  editTodo(todo) {
    this.beforeEditCache = todo.title
    this.editedTodo = todo
  },

  doneEdit(todo) {
    if (!this.editedTodo) {
      return
    }
    this.editedTodo = null
    todo.title = todo.title.trim()
    if (!todo.title) {
      this.removeTodo(todo)
    }

    this.evt({
      type: 'change',
      task: todo
    })
  },

  cancelEdit(todo) {
    this.editedTodo = null
    todo.title = this.beforeEditCache
  },

  changeComplete(todo) {
    this.evt({
      type: todo.completed ? 'done' : 'change',
      task: todo
    })
  },

  removeCompleted() {
    this.todos = filters.active(this.todos)
    // TODO: evt()
  },

  pluralize(n) {
    return n === 1 ? 'item' : 'items'
  },

  linky(t) {
      return t.replace(/\[([^\]]+) (http[^\]]+)\]/g,'<a href="$2" target="_blank">$1</a>')
  },

  async evt(payload) {
    const mut = await fetch('/mutate', {
      method: 'post',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    })

    // Store state updates
    const updates = await mut.json()

    this.todos = updates.todos
    this.events = updates.events
  },

  async handler(template = 'javascript', open = true ) {
    const id = 0
    console.log(`Initializing handler[${id}] for ${template}...`)

    // Do not allow concurrent deploys
    this.deploying = true

    try {
      // initialize this handler function
      let hInit
      try {
        hInit = await fetch(`/compute/create?id=${id}`, {
          method: 'POST',
        })
      } catch(e) { console.error(e) }

      if (hInit?.status !== 200) {
        throw new Error(`${hInit.url} - Failed, HTTP/${hInit.status}`)
      }

      // open or return the local editor API URL that redirects to the editor
      const editorUrl = `/compute/editor/${id}?t=${template}`
      if (open) {
        window.open(editorUrl, '_blank')
      }

      return editorUrl
    }
    catch (e) {
      console.error(e)
    }

    this.deploying = false
    console.log('Deployment finished.')
  }
}).mount('body')
