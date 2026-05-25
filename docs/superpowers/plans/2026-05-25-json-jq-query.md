# JSON JQ Quick Command — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a jq query bar to the JSON Formatter that lets users run jq filters against their JSON and see results in a dedicated output panel.

**Architecture:** Single-file change to `pages/tools/json/index.js`. Add a query input between the toolbar and textarea, a results panel below the textarea, and wire up `jq-web`'s `.json()` API to execute filters. No new files — the component is self-contained and small enough.

**Tech Stack:** Next.js 14.1, React 18.2, jq-web 0.6.2

---

### Task 1: Install jq-web dependency

- [ ] **Step 1: Install jq-web**

Run: `npm install jq-web`
Expected: jq-web added to package.json and node_modules

### Task 2: Add query input and results panel to JSON tool

**Files:**
- Modify: `pages/tools/json/index.js`

- [ ] **Step 1: Add imports for jq and keyboard hook**

At the top of the file, add the jq import:

```js
import { useState, useMemo, useCallback, useEffect } from 'react';
import Head from 'next/head';
import { Button } from '../../../components/ui/button';

let jqPromise = null;
function getJq() {
  if (!jqPromise) {
    jqPromise = import('jq-web').then(m => m.default || m);
  }
  return jqPromise;
}
```

- [ ] **Step 2: Add query state and run handler**

Add these state variables inside the `JsonTool` component after the existing state declarations:

```js
const [query, setQuery] = useState('');
const [queryResult, setQueryResult] = useState(null);
const [queryError, setQueryError] = useState('');
const [queryRunning, setQueryRunning] = useState(false);
```

Add the run handler:

```js
const handleRunQuery = useCallback(async () => {
  if (!query.trim() || !input.trim()) return;
  setQueryRunning(true);
  setQueryError('');
  setQueryResult(null);
  try {
    const parsed = JSON.parse(input);
    const jq = await getJq();
    const result = await jq.promised.json(parsed, query.trim());
    setQueryResult(result);
  } catch (e) {
    if (e.message?.includes('JSON')) {
      setQueryError('Invalid JSON input');
    } else {
      setQueryError(e.message || String(e));
    }
  } finally {
    setQueryRunning(false);
  }
}, [query, input]);
```

- [ ] **Step 3: Add keyboard shortcut for Cmd/Ctrl+Enter**

Add a `useEffect` for the keyboard shortcut before the return statement:

```js
useEffect(() => {
  const handler = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunQuery();
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, [handleRunQuery]);
```

- [ ] **Step 4: Add the query input UI between toolbar and textarea**

Insert the query bar JSX between the toolbar `</div>` (after the Button group ending with Clear) and the `<textarea>`:

```jsx
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="jq filter...  (e.g. .users[].name)"
                className="w-full px-3 py-2 border border-border rounded bg-input text-text placeholder:text-textDim focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent font-mono text-control transition-colors duration-150"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-micro text-textDim bg-surface px-1.5 py-0.5 rounded border border-border hidden sm:inline-block">
                {typeof navigator !== 'undefined' && navigator.platform?.includes('Mac') ? '⌘' : 'Ctrl'}+Enter
              </kbd>
            </div>
            <Button onClick={handleRunQuery} disabled={queryRunning} variant="primary">
              {queryRunning ? 'Running...' : 'Run'}
            </Button>
          </div>
```

- [ ] **Step 5: Add the results panel below the textarea**

Insert after the textarea closing `/>` and before the error/success display:

```jsx
          {(queryResult !== null || queryError) && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-surface px-4 py-2.5 border-b border-border flex justify-between items-center">
                <h3 className="text-body-emphasis text-text">Query Results</h3>
                <button
                  onClick={() => { setQueryResult(null); setQueryError(''); }}
                  className="text-micro text-textMuted hover:text-text transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="p-4 bg-input">
                {queryError ? (
                  <div className="text-error text-control">{queryError}</div>
                ) : queryResult === null || queryResult === undefined ? (
                  <div className="text-textMuted text-control">No results</div>
                ) : (
                  <pre className="font-mono text-control text-text whitespace-pre overflow-x-auto">
                    {typeof queryResult === 'string'
                      ? queryResult
                      : JSON.stringify(queryResult, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}
```

- [ ] **Step 6: Start dev server and verify**

Run: `npm run dev`
Navigate to http://localhost:3000/tools/json
Paste test JSON: `{"users": [{"name": "Alice", "age": 30}, {"name": "Bob", "age": 25}]}`
Type query: `.users[].name`
Click Run
Expected: Results panel shows `["Alice", "Bob"]`

- [ ] **Step 7: Test edge cases**

| Test | Expected |
|------|----------|
| Invalid filter: `...` | Error message in results panel |
| Empty JSON + valid query | "Invalid JSON input" |
| Query returns null: `empty` | "No results" |
| Cmd/Ctrl+Enter | Executes query |
| Query returns nested object: `.users[0]` | Formatted JSON shown |

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json pages/tools/json/index.js
git commit -m "feat: add jq query bar to JSON Formatter tool

- Add jq-web WASM dependency for client-side jq execution
- Query input with jq filter syntax, between toolbar and textarea
- Results panel shows formatted JSON output with error handling
- Cmd/Ctrl+Enter keyboard shortcut to run query
- Supports all jq filter operations

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```
