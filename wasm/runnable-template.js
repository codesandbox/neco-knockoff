import { log, http, response } from "@flaki/runnable"

const SOURCE = 'subo'

const T_ADD = 'add'
const T_CHANGE = 'change'
const T_DONE = 'done'
const T_REM = 'rem'

export const run = (input) => {
  log.info(input)
  const { from, type, task, note } = JSON.parse(input);
  const updates = [];

  // If task is "important", we make! it! so!!!
  if ([T_ADD,T_CHANGE].includes(type) && task.title.match(/important/i)) {
    task.title += '!!!'

    updates.push({
      from: SOURCE,
      type: T_CHANGE,
      task,
      note: 'Added exclamation marks as this seems rather important!',
    });
  } 

  // Find url in input, scrape target page for title, linkify
  // TODO: this only handles a singe url for now
  if ([T_ADD,T_CHANGE].includes(type)) {
    let url = task.title.match(/http[s]?:\/\/\S+/)?.[0];
    if (url) {
        // Linkify, unless it's a link string already (ends in ])
        if (!url.endsWith(']')) {
        // Get the page and extract the title
        let res = http.get(url);
        let restext = res.text();
        let title = restext.match(/<title>([^<]*)<\/title>/);
        
        task.title = task.title.replace(url, `[${title[1].trim()} ${url}]`);
        updates.push({
            from: SOURCE,
            type: T_CHANGE,
            task,
            note: 'Expanded the title of the linked page for you',
        });
      }
    }
  }

  // Just Popeen doing what Popeens do best!
  const blurbs = [
    '*bap!*',
    'You won\'t be needing this, right?',
    'Hope that wasn\'t expensive!?',
    '*whack!*',
  ]

  if (type === T_DONE) {
    updates.push({
        from: SOURCE,
        type: T_REM,
        note: blurbs[Math.floor(Math.random()*blurbs.length)]
    })
  }

  response.contentType('application/json');
  return JSON.stringify(updates);
};
