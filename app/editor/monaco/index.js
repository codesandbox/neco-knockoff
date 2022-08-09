import * as monaco from 'monaco-editor/esm/vs/editor/editor.main.js';
import libSource from './runnable.d.ts';

// TODO: Add @suborbital.runtime types
// https://stackoverflow.com/questions/52290727/adding-typescript-type-declarations-to-monaco-editor
self.MonacoEnvironment = self.MonacoEnvironment || {};

MonacoEnvironment.getWorkerUrl = function (moduleId, label) {
	if (label === 'typescript' || label === 'javascript') {
		return WEBROOT+'/vs/language/typescript/ts.worker.js';
	}

	return WEBROOT+'/vs/editor/editor.worker.js';
};

// compiler options
monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
	target: monaco.languages.typescript.ScriptTarget.ES6,
	noLib: false,
	allowNonTsExtensions: true,
	moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
});

const libUri = 'file:///node_modules/@flaki/runnable.d.ts';
monaco.languages.typescript.javascriptDefaults.addExtraLib(
	//`declare module '@flaki/runnable' { ${libSource} }`,
	libSource,
	libUri);
monaco.editor.createModel(libSource, 'typescript', monaco.Uri.parse(libUri));
console.log(monaco)


fetch('/code').then(
	r => r.status === 200 ? r.text() : '// ❗️ HTTP '+r.status+' '+r.statusText
).then(code => {
	const container = document.getElementById('codeeditor');
	const editor = monaco.editor.create(container, {
		value: code,
		language: 'javascript'
	});

	MonacoEnvironment.editor = editor;
	console.log('Code editor initialized');

	// Allow for adjusting the editor container sizing when editing
	const layout = () => {
		editor.layout();
	}
	const focus = () => {
		container.classList.add('editing');
		setTimeout(layout, 0);
	}
	const blur = () => {
		container.classList.remove('editing');
		setTimeout(layout, 0);
	}

    editor.onDidFocusEditorWidget(focus);
    editor.onDidBlurEditorWidget(blur);


	// Add a "Save" button
	editor.addAction({
		// An unique identifier of the contributed action.
		id: 'save-run',

		// A label of the action that will be presented to the user.
		label: 'Save changes',

		// An optional array of keybindings for the action.
		keybindings: [
			monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
			monaco.KeyCode.F5,
		],

		precondition: null,
		keybindingContext: null,
		contextMenuGroupId: 'navigation',
		contextMenuOrder: 1.5,

		// TODO: turn on/off features when switching? https://microsoft.github.io/monaco-editor/playground.html#creating-the-editor-editor-basic-options
		run: function (ed) {
			if (MonacoEnvironment.saveAction) {
				console.log('Saving...');
				MonacoEnvironment.saveAction(ed);
			} else {
				console.log('Saved, but no Save action specified!');
			}
		}
	});
});
