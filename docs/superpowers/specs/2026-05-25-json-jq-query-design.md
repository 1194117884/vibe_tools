# JSON JQ Quick Command — Design

## Summary

Add a jq-powered query bar to the JSON Formatter tool. Users type jq filters (e.g., `.users[].name`) into a command input and see results in a dedicated output panel below the textarea.

## UI Layout

```
[ Monospace input: ".users[].name"    ]  [ Run ]
[ JSON textarea                                                  ]
[ Query results panel: formatted JSON output + Copy button       ]
```

- Query input sits between the toolbar and the textarea
- Results appear in a new panel below the textarea
- `Cmd+Enter` / `Ctrl+Enter` shortcut to execute
- Invalid filter shows jq error message inline
- Empty/null result shows "No results"

## Query Engine

`jq-web` (npm, v0.6.2) — WASM-based jq running entirely client-side. No server dependency. API:

```js
import jq from 'jq-web';
const result = await jq.promised.json(jsObject, filterString);
```

## Edge Cases

- **Empty query**: don't show results panel
- **Invalid JSON input**: existing error handling covers this
- **Invalid jq filter**: show jq's error message in results panel
- **Empty/null result**: show "No results" message

## Not in Scope

- Query history
- Multiple simultaneous queries
- Filter presets/saved queries
