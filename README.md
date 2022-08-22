# Knockoff - now with 100% more Compute!

Knockoff is a playful TODO list demo app built to showcase Wasm-extensibility with the Suborbital Compute platform.

Compared to its younger cousin, this version is meant to showcase a full Suborbital Compute integration scenario, and while the backend is built in Node.js it actually does not use the Node.js SDK and is meant more as a showcase for general backend integration compatibility, rather than Node.js specifically (e.g. would probably run with few modifications in Deno).

Highlights:

- Built largely on off-the-shelf code
- Event visualization log panel to highlight the actions performed by Wasm integrations
- Support for WebAssembly functions in all Compute-supported languages (JS, TS, AssemblyScript, Rust)

> *"POPeen" logo by [@whoisaldeka](https://twitter.com/whoisaldeka/status/1138678402930470913)*


## How to use

Fork this repository into your own GitHub account, and then import the new repo into [CodeSandbox Projects](https://projects.codesandbox.io/).

If this is the first time you are launching the editor, you will need to open a new terminal and run `csb-init.sh` to generate a new Suborbital Compute token. If you already have a token you may add it as `SCC_ENV_TOKEN` to the environment configuration of CodeSandbox: find the option in the bottom left of the hamburger-menu (button on top left).

Once inside the editor, you can use the `Tasks` (in the `➕` menu in the top-right of the editor) to manage the application. Use `Run App & Compute` to launch the various containers of Suborbital Compute and the knockoff app (on top of `docker compose`).

After launching, you can open Knockoff by clicking `➕` -> Other Previews -> Port 3000.

The WebAssembly integration reacts to certain events and content and updates the todo list. The integration example in `app/wasm/runnable-template.js` does the following:

- Appends exclamation marks to to-do items containing the word *"important"*
- Uses the [http Runnable API](https://docs.suborbital.dev/atmo/runnable-api/http-client) API to expand URLs into links that use the target page title
- Adds quips and remarks once a task is marked as done

The app state is persisted temporarily, for a clean slate you can use the [`/reset`](https://knockoff.fly.dev/reset) endpoint or restart the preview.


## Writing integrations

The WebAssembly module receives `Update`-s from the backend in the form of a JSON-string serialized object:

```json
{
    "from": "you",
    "type": "add|change|del|rem|done",
    "note": "comment, not currently used in incoming updates",
    "task": Task
}
```

`from` contains the 'sender', or creator of the event. The Wasm integrations should use the canonical `subo` sender, everything else is mostly ignored.

The `Update` types are:
- `add`: a new task was created
- `change`: a task (name) was changed
- `del`: a task was removed (deleted completely)
- `done`: a task was marked as done
- `rem`: a comment was added, no task was changed

Comments are not exposed in the user UI, and rather are just a fun way to add reactions that do not involve changing any task.

The `Task` object:

```json
{
    "id": 0,
    "title": "task name",
    "completed": false
}
```

The task id is a numerical sequential ID from the UI. Creating brand new tasks are currently not possible from Wasm (as the IDs would get desynchronized).

The WebAssembly function may use incoming `Updates` and the `Task` inside and return 0 or more `Update`-s as an array in a JSON-serialized string. These updates are then merged with the current application state and synchronized with the client.


## The nitty-gritty

Knockoff has a UI, a backend that handles the Wasm extensibility and persistence API and integrates [Suborbital Compute](https://suborbital.dev) to run custom WebAssembly extensions that process change events to the application state.

### The frontend

The UI is based on the [TODOMVC Vue App](https://todomvc.com/examples/vue/). The UI is actually based on one of the [petite-vue](https://github.com/vuejs/petite-vue) sample apps, which means there are no build steps involved (just edit the files in `www`), but do note that there are [certain differences compared to mainline vue](https://github.com/vuejs/petite-vue#features).

### The backend

The backend is a simple Node.js application that serves up the app UI, provides the APIs to update the shared state (todos & change events) and handles the integration with Suborbital Compute, provisioning new runnables and executing them upon change events occurring.

### Suborbital Compute

The Suborbital Compute integration is a [tweaked version of the Local Deployment scenario](https://docs.suborbital.dev/compute/get-started#run-compute-locally), that spins up all required Suborbital services (Control Plane, Builder, Atmo instance runner) using `docker compose` locally. It then co-locates the `scc-app` container that serves the UI and runs the Node.js backend into the same cluster, so it may communicate directly with Compute.

## Missing features

- **A good bunch of refactoring** - the code is a bit of a mess
- **We could use the [Node.js SDK](https://www.npmjs.com/package/@suborbital/compute)** - while writing the integration from scratch was illuminating, showcasing a more conventional integration scenario would be better
- **Live synchronization** - multiple users/browsers can manipulate the items at the same time and sometimes this will work but there is no live synchronization
- **Multiple event handlers** - currently a single Wasm handler is provided to manipulate todo items and events. SCN could provision unlimited event handlers that could run sequentially on all new events.
- **Better state & events handling**
- **More example runanbles in more languages**
