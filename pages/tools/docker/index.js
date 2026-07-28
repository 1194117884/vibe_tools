import { useMemo, useState } from 'react';
import Head from 'next/head';
import { Button } from '../../../components/ui/button';

/**
 * Tokenize a docker run command, respecting single/double quotes.
 */
export function tokenize(command) {
  const tokens = [];
  let current = '';
  let quote = null;

  for (let i = 0; i < command.length; i += 1) {
    const ch = command[i];
    if (quote) {
      if (ch === quote) {
        quote = null;
      } else if (ch === '\\' && i + 1 < command.length) {
        current += command[i + 1];
        i += 1;
      } else {
        current += ch;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (/\s/.test(ch)) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      continue;
    }
    current += ch;
  }
  if (current) tokens.push(current);
  return tokens;
}

/**
 * Convert a `docker run ...` command string into a docker-compose YAML snippet.
 */
export function dockerRunToCompose(command) {
  const cleaned = command
    .replace(/\\\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) {
    throw new Error('Paste a docker run command.');
  }

  const tokens = tokenize(cleaned);
  let i = 0;

  // Allow optional leading "sudo" and "docker" / "docker.exe"
  if (tokens[i] === 'sudo') i += 1;
  if (tokens[i] === 'docker' || tokens[i] === 'docker.exe') i += 1;
  if (tokens[i] === 'run') i += 1;
  else if (!cleaned.includes('run')) {
    // still try to parse flags even without "docker run" prefix
  }

  const service = {
    image: null,
    container_name: null,
    ports: [],
    volumes: [],
    environment: [],
    restart: null,
    network_mode: null,
    networks: [],
    command: [],
    entrypoint: null,
    user: null,
    working_dir: null,
    hostname: null,
    privileged: false,
    stdin_open: false,
    tty: false,
    labels: [],
    extra_hosts: [],
    depends_on: [],
  };

  const takeValue = () => {
    if (i >= tokens.length) throw new Error(`Missing value after ${tokens[i - 1]}`);
    const v = tokens[i];
    i += 1;
    return v;
  };

  const positional = [];

  while (i < tokens.length) {
    const t = tokens[i];
    i += 1;

    if (t === '-d' || t === '--detach') continue;
    if (t === '--rm') continue;
    if (t === '-it' || t === '-ti') {
      service.stdin_open = true;
      service.tty = true;
      continue;
    }
    if (t === '-i' || t === '--interactive') {
      service.stdin_open = true;
      continue;
    }
    if (t === '-t' || t === '--tty') {
      service.tty = true;
      continue;
    }
    if (t === '--privileged') {
      service.privileged = true;
      continue;
    }
    if (t === '-p' || t === '--publish') {
      service.ports.push(takeValue());
      continue;
    }
    if (t.startsWith('-p=') || t.startsWith('--publish=')) {
      service.ports.push(t.split('=').slice(1).join('='));
      continue;
    }
    if (t === '-v' || t === '--volume') {
      service.volumes.push(takeValue());
      continue;
    }
    if (t.startsWith('-v=') || t.startsWith('--volume=')) {
      service.volumes.push(t.split('=').slice(1).join('='));
      continue;
    }
    if (t === '-e' || t === '--env') {
      service.environment.push(takeValue());
      continue;
    }
    if (t.startsWith('-e=') || t.startsWith('--env=')) {
      service.environment.push(t.split('=').slice(1).join('='));
      continue;
    }
    if (t === '--name') {
      service.container_name = takeValue();
      continue;
    }
    if (t.startsWith('--name=')) {
      service.container_name = t.slice('--name='.length);
      continue;
    }
    if (t === '--restart') {
      service.restart = takeValue();
      continue;
    }
    if (t.startsWith('--restart=')) {
      service.restart = t.slice('--restart='.length);
      continue;
    }
    if (t === '--network' || t === '--net') {
      const net = takeValue();
      if (net === 'host' || net === 'none' || net.startsWith('container:')) {
        service.network_mode = net;
      } else {
        service.networks.push(net);
      }
      continue;
    }
    if (t === '-w' || t === '--workdir') {
      service.working_dir = takeValue();
      continue;
    }
    if (t === '-u' || t === '--user') {
      service.user = takeValue();
      continue;
    }
    if (t === '-h' || t === '--hostname') {
      service.hostname = takeValue();
      continue;
    }
    if (t === '--entrypoint') {
      service.entrypoint = takeValue();
      continue;
    }
    if (t === '-l' || t === '--label') {
      service.labels.push(takeValue());
      continue;
    }
    if (t === '--add-host') {
      service.extra_hosts.push(takeValue());
      continue;
    }
    if (t === '--link') {
      // ignored / legacy
      takeValue();
      continue;
    }
    if (t.startsWith('-')) {
      // Unknown flag: skip optional value if next token doesn't look like a flag/image
      if (i < tokens.length && !tokens[i].startsWith('-') && !tokens[i].includes('/')) {
        // keep image detection simple — leave unknown values as positional later
      }
      continue;
    }

    positional.push(t);
    // Remaining tokens after image are the command
    while (i < tokens.length) {
      positional.push(tokens[i]);
      i += 1;
    }
  }

  if (positional.length === 0) {
    throw new Error('Could not find an image name in the command.');
  }

  service.image = positional[0];
  service.command = positional.slice(1);

  const name =
    service.container_name ||
    service.image
      .split('/')
      .pop()
      .split(':')[0]
      .replace(/[^a-zA-Z0-9_-]/g, '_') ||
    'app';

  const lines = ['services:', `  ${name}:`, `    image: ${service.image}`];

  if (service.container_name) lines.push(`    container_name: ${service.container_name}`);
  if (service.restart) lines.push(`    restart: ${service.restart}`);
  if (service.user) lines.push(`    user: ${JSON.stringify(service.user)}`);
  if (service.working_dir) lines.push(`    working_dir: ${JSON.stringify(service.working_dir)}`);
  if (service.hostname) lines.push(`    hostname: ${service.hostname}`);
  if (service.entrypoint) lines.push(`    entrypoint: ${JSON.stringify(service.entrypoint)}`);
  if (service.privileged) lines.push('    privileged: true');
  if (service.stdin_open) lines.push('    stdin_open: true');
  if (service.tty) lines.push('    tty: true');
  if (service.network_mode) lines.push(`    network_mode: ${service.network_mode}`);

  if (service.ports.length) {
    lines.push('    ports:');
    service.ports.forEach((p) => lines.push(`      - ${JSON.stringify(p)}`));
  }
  if (service.volumes.length) {
    lines.push('    volumes:');
    service.volumes.forEach((v) => lines.push(`      - ${JSON.stringify(v)}`));
  }
  if (service.environment.length) {
    lines.push('    environment:');
    service.environment.forEach((e) => lines.push(`      - ${JSON.stringify(e)}`));
  }
  if (service.networks.length) {
    lines.push('    networks:');
    service.networks.forEach((n) => lines.push(`      - ${n}`));
  }
  if (service.labels.length) {
    lines.push('    labels:');
    service.labels.forEach((l) => lines.push(`      - ${JSON.stringify(l)}`));
  }
  if (service.extra_hosts.length) {
    lines.push('    extra_hosts:');
    service.extra_hosts.forEach((h) => lines.push(`      - ${JSON.stringify(h)}`));
  }
  if (service.command.length) {
    lines.push(`    command: ${JSON.stringify(service.command)}`);
  }

  return lines.join('\n') + '\n';
}

const SAMPLE =
  'docker run -d --name redis -p 6379:6379 -v redis-data:/data -e REDIS_PASSWORD=secret --restart unless-stopped redis:7 redis-server --appendonly yes';

export default function DockerTool() {
  const [input, setInput] = useState(SAMPLE);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    try {
      return { yaml: dockerRunToCompose(input), error: null };
    } catch (e) {
      return { yaml: '', error: e.message };
    }
  }, [input]);

  const handleCopy = async () => {
    if (!result.yaml) return;
    await navigator.clipboard.writeText(result.yaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>Docker Compose - Vibe Tools</title>
        <meta name="description" content="Convert docker run commands to docker-compose YAML" />
      </Head>
      <header className="border-b border-border py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">Docker Compose</h1>
          <p className="text-body text-textMuted">Convert a docker run command into compose YAML</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <div>
            <label className="block text-control font-medium text-text mb-2">docker run command</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="docker run -d -p 80:80 nginx"
              className="w-full h-40 p-4 border border-border rounded bg-input text-text font-mono text-control focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent resize-y"
            />
          </div>

          {result.error && (
            <div className="text-error text-control p-3 bg-errorBg rounded">{result.error}</div>
          )}

          {result.yaml && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-surface px-4 py-2.5 border-b border-border flex justify-between items-center">
                <h3 className="text-body-emphasis text-text">docker-compose.yml</h3>
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <pre className="p-4 text-control font-mono text-text whitespace-pre overflow-x-auto max-h-96 overflow-y-auto bg-input">
                {result.yaml}
              </pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
