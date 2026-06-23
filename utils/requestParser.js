function stripLineContinuations(input) {
  return input.replace(/\\\r?\n/g, ' ');
}

export function tokenizeShell(input) {
  const text = stripLineContinuations(input).trim();
  const tokens = [];
  let current = '';
  let quote = null;
  let escaped = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (char === '\\' && quote !== "'") {
      escaped = true;
      continue;
    }

    if ((char === "'" || char === '"') && !quote) {
      quote = char;
      continue;
    }

    if (char === quote) {
      quote = null;
      continue;
    }

    if (/\s/.test(char) && !quote) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      continue;
    }

    current += char;
  }

  if (current) tokens.push(current);
  return tokens;
}

function parseHeader(value) {
  const index = value.indexOf(':');
  if (index === -1) return { key: value.trim(), value: '', enabled: true };
  return {
    key: value.slice(0, index).trim(),
    value: value.slice(index + 1).trim(),
    enabled: true,
  };
}

function findUrlInText(input) {
  const match = input.match(/https?:\/\/[^\s'"\\]+/i);
  return match ? match[0] : input.trim().split(/\r?\n/)[0]?.trim();
}

function toUrlParts(urlValue) {
  const url = new URL(urlValue);
  return {
    protocol: url.protocol.replace(':', ''),
    host: url.host,
    path: url.pathname,
    query: Array.from(url.searchParams.entries()).map(([key, value]) => ({
      key,
      value,
      enabled: true,
    })),
  };
}

function parseBodyParams(body) {
  if (!body || !body.includes('=')) return [];
  try {
    return Array.from(new URLSearchParams(body).entries()).map(([key, value]) => ({
      key,
      value,
      enabled: true,
    }));
  } catch {
    return [];
  }
}

function parseLooseSections(input) {
  const lines = input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const urlValue = findUrlInText(input);
  const headers = [];
  const bodyLines = [];
  let inBody = false;

  for (const line of lines.slice(1)) {
    if (line === '') {
      inBody = true;
      continue;
    }
    if (!inBody && /^[A-Za-z0-9-]+:\s*/.test(line)) {
      headers.push(parseHeader(line));
    } else {
      inBody = true;
      bodyLines.push(line);
    }
  }

  const body = bodyLines.join('\n');
  return { urlValue, method: body ? 'POST' : 'GET', headers, body };
}

export function parseRequestInput(input) {
  const trimmed = input.trim();
  if (!trimmed) throw new Error('Paste a curl command or request URL first.');

  const tokens = tokenizeShell(trimmed);
  let urlValue = '';
  let method = 'GET';
  const headers = [];
  const bodyParts = [];

  if (tokens[0] === 'curl') {
    for (let i = 1; i < tokens.length; i += 1) {
      const token = tokens[i];
      const next = tokens[i + 1];

      if (token === '-X' || token === '--request') {
        method = (next || method).toUpperCase();
        i += 1;
      } else if (token.startsWith('-X') && token.length > 2) {
        method = token.slice(2).toUpperCase();
      } else if (token === '-H' || token === '--header') {
        if (next) headers.push(parseHeader(next));
        i += 1;
      } else if (token.startsWith('-H') && token.length > 2) {
        headers.push(parseHeader(token.slice(2)));
      } else if (['-d', '--data', '--data-raw', '--data-binary', '--data-urlencode'].includes(token)) {
        if (next) bodyParts.push(next);
        i += 1;
      } else if (token.startsWith('--url=')) {
        urlValue = token.slice('--url='.length);
      } else if (token === '--url') {
        urlValue = next || urlValue;
        i += 1;
      } else if (!token.startsWith('-') && !urlValue) {
        urlValue = token;
      }
    }
  } else {
    const loose = parseLooseSections(trimmed);
    urlValue = loose.urlValue;
    method = loose.method;
    headers.push(...loose.headers);
    if (loose.body) bodyParts.push(loose.body);
  }

  if (!urlValue) throw new Error('Could not find a request URL.');
  const body = bodyParts.join('&');
  if (body && method === 'GET') method = 'POST';

  return {
    method,
    ...toUrlParts(urlValue),
    headers,
    body,
    bodyParams: parseBodyParams(body),
  };
}

export function buildUrl(request) {
  const url = new URL(`${request.protocol || 'https'}://${request.host || 'example.com'}${request.path || '/'}`);
  for (const param of request.query || []) {
    if (param.enabled === false || !param.key) continue;
    url.searchParams.append(param.key, param.value || '');
  }
  return url.toString();
}

export function buildBody(request) {
  if (request.bodyParams?.length) {
    const params = new URLSearchParams();
    for (const param of request.bodyParams) {
      if (param.enabled === false || !param.key) continue;
      params.append(param.key, param.value || '');
    }
    return params.toString();
  }
  return request.body || '';
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`;
}

export function buildCurl(request) {
  const lines = [`curl ${shellQuote(buildUrl(request))}`];
  if (request.method && request.method.toUpperCase() !== 'GET') {
    lines.push(`-X ${shellQuote(request.method.toUpperCase())}`);
  } else if (request.method?.toUpperCase() === 'GET') {
    lines.push("-X 'GET'");
  }

  for (const header of request.headers || []) {
    if (header.enabled === false || !header.key) continue;
    lines.push(`-H ${shellQuote(`${header.key}: ${header.value || ''}`)}`);
  }

  const body = buildBody(request);
  if (body) lines.push(`--data-raw ${shellQuote(body)}`);

  return lines.join(' \\\n  ');
}
