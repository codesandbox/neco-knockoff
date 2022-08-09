import { writeFile, readFile } from 'node:fs/promises'
import { execFile } from 'node:child_process'

import { fileURLToPath } from 'node:url'
const DIR = fileURLToPath(new URL('./', import.meta.url))

export const targetPort = process.env.SATPORT || 9000;

/*
subo create runnable --lang javascript test123
<update test123/src/lib.js>
cd test123
npm install
npm run build
sat test123.wasm
*/
let runnableState

// Base dependencies
const BASEDEPS = {
  "@flaki/runnable": "0.16.1",
  "esbuild-wasm": "0.14.51"
}
export async function provisionRunnable(main, name = 'r0001', type = 'javascript', mode = 'production') {
  let code, deps, env;
  if (typeof main === 'object') {
    code = main.code;
    name = main.name ?? name
    type = main.type ?? type
    mode = main.mode ?? mode
    deps = { ...BASEDEPS, ...(main.deps ?? {}) }
    env = main.env
  } else {
    code = main
  }
  const res = []

  // if running, shut it down
  if (runnableState?.sat && runnableState.sat.exitCode === null) {
    console.log('shutting down obsolete sat process...')
    await new Promise(resolve => {
      runnableState.sat.on('close', resolve)
      runnableState.sat.kill()
    })
    runnableState.sat = null
  }

  // if exists don't recreate it
  process.chdir(DIR)

  try {
    res.push(await run(`subo create runnable --lang ${type} ${name}`))

    // Instead of patching we fully rewrite the package.json
    await writeFile(`${name}/package.json`,JSON.stringify({
      "name": name,
      "description": "",
      "version": "",
      "dependencies": deps,
      "scripts": {
        // note, this won't work on Windows
        "prebuild": "esbuild src/index.js --log-level=error --bundle --outdir=build --format=iife --global-name=Suborbital --inject:../textencoderdecoder.js --minify",
        "prebuild:debug": "esbuild src/index.js --log-level=error --bundle --outdir=build --format=iife --global-name=Suborbital --inject:../textencoderdecoder.js --sourcemap=external",
        // Javy is the slowest path, takes 2.5s (majority of the ~3.8s subsequent rebuild times)
        "build": "javy build/index.js -o r0001.wasm"
      }
    }, null, 2))

    // Also patch src/index.js
    const boilerplate = (await readFile(`${name}/src/index.js`)).toString()
    await writeFile(`${name}/src/index.js`, boilerplate.replace(
      '@suborbital/runnable',
      '@flaki/runnable'
    // Remove the TextEncoder/Decoder polyfill (as now it is included build-time)
    ).replace('import "fastestsmallesttextencoderdecoder-encodeinto/EncoderDecoderTogether.min.js";',''))
  }
  catch(e) {
    res.push(e)
  }

  // update code with replacements
  if (env && env.length > 0) {
    for (e of env) {
      code = code.replace(new RegExp('\\$'+e[0], 'g'), e[1])
    }
    console.log(env.length +' variables replaced')
  }

  // write code
  await writeFile(`${name}/src/lib.js`, code)

  process.chdir(DIR+'/'+name)

  // Installs will prefer cache
  res.push(await run('pnpm install --prefer-offline'))

  res.push(await run('pnpm run prebuild' + (mode !== 'production' ? ':'+mode : '')))
  res.push(await run('pnpm run build'))

  const sat = execFile('sat', [`${name}.wasm`], { env: { ...process.env, SAT_HTTP_PORT: targetPort }}, (error, stdout, stderr) => {
    if (error) {
      throw error;
    }
    console.log(stderr);
    console.log(stdout);
    console.log(`sat process exited`);
  });

  sat.stdout.on('data', (data) => {
    console.log(data);
  });

  runnableState = { sat, result: res }
  return runnableState
}

// tiny wrapper to run external commands
const run = async (cmd) => {
  return await new Promise((resolve, reject) => {
    let commandline = String(cmd).split(' ')
    let command = commandline.shift()

    console.log(`>  ${command}  ${commandline.join(' ')} ...`)
    execFile(command, commandline, (error, stdout, stderr) => {
      if (error) {
        console.error(error)
        reject(error)
      } else {
        resolve({stdout,stderr})
      }
    })
  })
};
