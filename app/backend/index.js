const PORT = process.env.PORT || 8080

import { fileURLToPath } from 'node:url'
const WWWROOT = fileURLToPath(new URL('../www', import.meta.url))

import sirv from 'sirv'
import polka from 'polka'

import bodyparser from 'body-parser'

//import { createProxyMiddleware } from 'http-proxy-middleware'


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

  // No longer making deployments but keeping this as a deploy callback for now
  .post('/deploy', async (req, res) => {

    // Log successful deployment
    state.events.push({ from: 'subo', type: 'rem', note: 'New day, new me! ✨' })

    // Send updated state
    sendState(res)
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

    /* TODO: should this remove all runnables? */

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
      let evlist

      /* TODO: enumerate SCN functions and execute them 
      let runnableUrl = ''
      try {
        const res = await fetch(runnableUrl, {
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
      */

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

  /* TODO: we probably no longer need to proxy to the runnables
  .use(
    '/sat',
    createProxyMiddleware({
      target: SATURL
    })
  )
  */

  .listen(PORT, err => {
    if (err) throw err;
    console.log(`Webserver listening on ${PORT}`);
  });



// For some reason inside docker Ctrl+C doesn't properly shut down the container without this
process.on('SIGINT', function handle(signal) {
  console.log(`Received ${signal}`);
  process.exit();
});
