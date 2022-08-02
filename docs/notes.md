Youtube link: http://youtu.be/s24AAA1F3OQ

Based on https://github.com/vuejs/petite-vue's TODOMVC impl.

Fully expanded task:
`Watchlist: [Flo Mask Pro - NIOSH &amp; NIST Tests - YouTube https://www.youtube.com/watch?v=s24AAA1F3OQ] (7:40)`

Title expansion runnable:
```js
import { log, http, response } from "@flaki/runnable";

export const run = (input) => {
  let res = http.get('https://www.youtube.com/watch?v=s24AAA1F3OQ');
  let restext = res.text();
  let title = restext.match(/<title>([^<]*)<\/title>/)

  response.contentType('text/plain');
  return title[1];
};
```

Sample events:
```html
<p>🐼 Subo has changed a task: 📝 [Flo Mask Pro - NIOSH &amp; NIST Tests - YouTube https://www.youtube.com/watch?v=s24AAA1F3OQ] (7:40) <em>This is a YouTube link so FYI I added its duration</em></p>
<p>🐼 Subo has changed a task: 📝 [Flo Mask Pro - NIOSH &amp; NIST Tests - YouTube https://www.youtube.com/watch?v=s24AAA1F3OQ] <em>Expanded the title of the linked page for you</em></p>
<p>🧒 You added a new item: 📝 http://youtu.be/s24AAA1F3OQ</p>
<p>🧒 You have completed a task: ✅ Important task!!!</p>
<p>🐼 Subo has changed a task: 📝 Important task!!! <em>Added exclamation marks as this seems rather important!</em></p>
<p>🧒 You added a new item: 📝 Important task</p>
<p>🧒 You created a new TODO list</p>
```

Eventlist (JSON):
```json
[{
    "from": "you|subo",
    "type": "add|del|done|change|rem",
    "task": 0,
    "note": "",
}]
```

Sample event data:

```js
{
  type: 'rem',
  note: 'A mew TODO list has been created.'
},
{
  type: 'add',
  task: {
		id: 0,
		title: 'boring stuff',
		completed: false
	}
},
{
  type: 'add',
  task: {
		id: 1,
		title: 'important thingamajig',
		completed: false
	}
},
{
  from: 'subo',
  type: 'change',
  task: {
    id: 1,
    title: 'important thingamajig',
    completed: false
  },
  note: "Added exclamation marks as this seems rather important!"
}
```


Get NPM package:

```
npm pack @flaki/runnable@0.16.1
```

Typings for runnables:
npm i -g dts-gen @flaki/runnable@0.16.1
dts-gen -m @flaki/runnable -s
dts-gen -m @flaki/runnable -f runnable.d.ts

https://github.com/Microsoft/monaco-editor/issues/1415#issuecomment-482521445

```
monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
target: monaco.languages.typescript.ScriptTarget.ES2016,
allowNonTsExtensions: true,
moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
});

const MONACO_LIB_PREFIX = 'file:///node_modules/';
const path = ${MONACO_LIB_PREFIX}${lib.name};
monaco.languages.typescript.typescriptDefaults.addExtraLib(lib.dts, path);

so, extralib full name becomes like file:///node_modules/@angular/core/index.d.ts
lib.dts is the contents, like export * from './router'
```

```
var libUri = 'ts:filename/facts.d.ts';
monaco.languages.typescript.javascriptDefaults.addExtraLib(libSource, libUri);
// When resolving definitions and references, the editor will try to use created models.
// Creating a model for the library allows "peek definition/references" commands to work with the library.
monaco.editor.createModel(libSource, 'typescript', monaco.Uri.parse(libUri));
```

https://microsoft.github.io/monaco-editor/playground.html#extending-language-services-configure-javascript-defaults


```
monaco.languages.typescript.typescriptDefaults.addExtraLib(
  `declare module '@my-project/package-one' { ${source1} }`,
  'file:///node_modules/@my-project/package-one/index.d.ts' // irrelevant?
);
```
https://stackoverflow.com/a/66948535

tsc --declaration --emitDeclarationOnly -p ../package/ --outFile runnable.d.ts
declare module "index" => declare module "@flaki/runnable"

https://www.typescriptlang.org/docs/handbook/compiler-options.html