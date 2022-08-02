import { readFileSync } from 'fs'
import { provisionRunnable, targetPort } from './provision-runnable.js'

const PORT = process.env.PORT || 8080

const SATURL = 'http://localhost:'+targetPort

import { fileURLToPath } from 'node:url'
const WWWROOT = fileURLToPath(new URL('../www', import.meta.url))

import sirv from 'sirv'
import polka from 'polka'

import bodyparser from 'body-parser'

import { createProxyMiddleware } from 'http-proxy-middleware'


const DEFAULT_HANDLER = readFileSync(fileURLToPath(new URL('../wasm/runnable-template.js', import.meta.url))).toString()
let handlerCode = DEFAULT_HANDLER

let state = {
  todos: [],
  events: []
}

const sendState = (res) =>{
  // TODO: maybe skip sending if there was no updates?
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(state))
}

polka()
  .use(sirv(WWWROOT, { maxAge: 60 }))
	.use(bodyparser.json())

  // Update the deployed WebAssembly processing script
  .post('/deploy', async (req, res) => {
    await provisionRunnable(req.body)
    handlerCode = req.body.code

    // Log successful deployment
    state.events.push({ from: 'subo', type: 'rem', note: 'New day, new me! ✨' })

    // Send updated state
		sendState(res)
	})
  // Get the source for the last-deployed script
  .get('/code', async (req, res) => {
		res.writeHead(200, { 'Content-Type': 'text/javascript' })
    res.end(handlerCode)
  })

  // Fetch the app state
  // TODO: partial updates - only send state if there were new events
  // since the client's last update
  .get('/state', async (req, res) => {
    sendState(res)
  })

  // Reset persistent app state: todos, events & runnable
  .get('/reset', async (req, res) => {
    state.todos = []
    state.events = []
    handlerCode = DEFAULT_HANDLER

    await provisionRunnable(handlerCode)

		res.writeHead(303, { 'Content-Type': 'text/plain', 'Location': '/' })
    res.end('OK')
  })

  // New event occurred
  .post('/mutate', async (req, res) => {
    const ev = req.body

    // Log the event
    state.events.push(ev)

    // Update state
    if (ev.type === 'del') {
      state.todos = state.todos.filter(event => event.id !== ev.task.id)

    } else if (ev.task) {
      state.todos[ev.task.id] = ev.task
    }

    // Pipe user events through our processing script
    if (ev.from !== 'subo') {
      // Technically we could also invoke sat as a binary
      let evlist
      try {
        const res = await fetch(SATURL, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(ev)
        })

        evlist = await res.json()
      }
      catch (e) {
        res.writeHead(500, { 'Content-Type': 'text/plain' })
        res.end(e.toString())
        return
      }

      console.log(evlist)

      if (Array.isArray(evlist)) {
        evlist.forEach(ev => {
          if (ev.task) state.todos[ev.task.id] = ev.task
          state.events.push(ev)
        })
      }
    }

    // Send updated state
    sendState(res)
  })

  // Proxy the runnable under the /sat endpoint
  .use(
    '/sat',
    createProxyMiddleware({
      target: SATURL
    })
  )

  .listen(PORT, err => {
    if (err) throw err;
    console.log(`Webserver listening on ${PORT}`);

    // Automatically provision the handler from the default template
    provisionRunnable({ code: handlerCode })
  });



// For some reason inside docker Ctrl+C doesn't properly shut down the container without this
process.on('SIGINT', function handle(signal) {
  console.log(`Received ${signal}`);
  process.exit();
});
