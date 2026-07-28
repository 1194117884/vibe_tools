import { useState } from 'react';
import Head from 'next/head';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { Button } from '../../../components/ui/button';

export function yamlToJson(yamlText, pretty = true) {
  if (!yamlText || !yamlText.trim()) {
    throw new Error('Enter YAML to convert.');
  }
  const data = parseYaml(yamlText);
  return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}

export function jsonToYaml(jsonText) {
  if (!jsonText || !jsonText.trim()) {
    throw new Error('Enter JSON to convert.');
  }
  const data = JSON.parse(jsonText);
  return stringifyYaml(data, { indent: 2, lineWidth: 0 });
}

const SAMPLE_YAML = `name: vibe-tools
version: 1.0.0
features:
  - json
  - yaml
  - regex
active: true
config:
  theme: dark
  retries: 3
`;

const SAMPLE_JSON = `{
  "name": "vibe-tools",
  "version": "1.0.0",
  "features": ["json", "yaml", "regex"],
  "active": true,
  "config": {
    "theme": "dark",
    "retries": 3
  }
}`;

export default function YamlTool() {
  const [input, setInput] = useState(SAMPLE_YAML);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const convert = (direction) => {
    try {
      const result = direction === 'toJson' ? yamlToJson(input) : jsonToYaml(input);
      setOutput(result);
      setError('');
      setCopied(false);
    } catch (e) {
      setError(e.message || 'Conversion failed');
      setOutput('');
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const loadSample = (kind) => {
    setInput(kind === 'yaml' ? SAMPLE_YAML : SAMPLE_JSON);
    setOutput('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>YAML ↔ JSON - Vibe Tools</title>
        <meta name="description" content="Convert between YAML and JSON" />
      </Head>
      <header className="border-b border-border py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">YAML ↔ JSON</h1>
          <p className="text-body text-textMuted">Convert configuration files between YAML and JSON</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => loadSample('yaml')}>
              Sample YAML
            </Button>
            <Button variant="outline" size="sm" onClick={() => loadSample('json')}>
              Sample JSON
            </Button>
          </div>

          <div>
            <label className="block text-control font-medium text-text mb-2">Input</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-56 p-4 border border-border rounded bg-input text-text font-mono text-control focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent resize-y"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => convert('toJson')}>YAML → JSON</Button>
            <Button onClick={() => convert('toYaml')} variant="outline">
              JSON → YAML
            </Button>
            <Button
              onClick={() => {
                if (output) {
                  setInput(output);
                  setOutput('');
                }
              }}
              variant="ghost"
              disabled={!output}
            >
              Use result as input
            </Button>
          </div>

          {error && <div className="text-error text-control p-3 bg-errorBg rounded">{error}</div>}

          {output && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-surface px-4 py-2.5 border-b border-border flex justify-between items-center">
                <h3 className="text-body-emphasis text-text">Result</h3>
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <pre className="p-4 text-control font-mono text-text whitespace-pre overflow-x-auto max-h-96 overflow-y-auto bg-input">
                {output}
              </pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
