import { useMemo, useState } from 'react';
import Head from 'next/head';
import { Button } from '../../../components/ui/button';

export const PERM_BITS = [
  { key: 'r', label: 'Read', value: 4 },
  { key: 'w', label: 'Write', value: 2 },
  { key: 'x', label: 'Execute', value: 1 },
];

export const GROUPS = [
  { key: 'owner', label: 'Owner (u)' },
  { key: 'group', label: 'Group (g)' },
  { key: 'public', label: 'Public (o)' },
];

export function emptyPerms() {
  return {
    owner: { r: false, w: false, x: false },
    group: { r: false, w: false, x: false },
    public: { r: false, w: false, x: false },
  };
}

export function octalFromPerms(perms) {
  const digit = (g) =>
    (perms[g].r ? 4 : 0) + (perms[g].w ? 2 : 0) + (perms[g].x ? 1 : 0);
  return `${digit('owner')}${digit('group')}${digit('public')}`;
}

export function symbolicFromPerms(perms) {
  const part = (g) =>
    `${perms[g].r ? 'r' : '-'}${perms[g].w ? 'w' : '-'}${perms[g].x ? 'x' : '-'}`;
  return `-${part('owner')}${part('group')}${part('public')}`;
}

export function permsFromOctal(octal) {
  const digits = String(octal).replace(/\D/g, '').padStart(3, '0').slice(-3);
  const parse = (d) => {
    const n = Number(d);
    return { r: (n & 4) !== 0, w: (n & 2) !== 0, x: (n & 1) !== 0 };
  };
  return {
    owner: parse(digits[0]),
    group: parse(digits[1]),
    public: parse(digits[2]),
  };
}

export function describePerms(perms) {
  const who = { owner: 'Owner', group: 'Group', public: 'Others' };
  return GROUPS.map(({ key }) => {
    const flags = PERM_BITS.filter((b) => perms[key][b.key]).map((b) => b.label.toLowerCase());
    return `${who[key]}: ${flags.length ? flags.join(', ') : 'none'}`;
  });
}

const PRESETS = [
  { label: '755', value: '755' },
  { label: '644', value: '644' },
  { label: '600', value: '600' },
  { label: '777', value: '777' },
  { label: '700', value: '700' },
  { label: '750', value: '750' },
];

export default function ChmodTool() {
  const [perms, setPerms] = useState(() => permsFromOctal('755'));
  const [copied, setCopied] = useState('');

  const octal = useMemo(() => octalFromPerms(perms), [perms]);
  const symbolic = useMemo(() => symbolicFromPerms(perms), [perms]);
  const descriptions = useMemo(() => describePerms(perms), [perms]);
  const command = `chmod ${octal} path`;

  const toggle = (group, bit) => {
    setPerms((prev) => ({
      ...prev,
      [group]: { ...prev[group], [bit]: !prev[group][bit] },
    }));
  };

  const setOctalInput = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 3);
    if (cleaned.length === 3) {
      setPerms(permsFromOctal(cleaned));
    }
  };

  const handleCopy = async (key, text) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 1200);
  };

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>Chmod Calculator - Vibe Tools</title>
        <meta name="description" content="Unix file permission calculator" />
      </Head>
      <header className="border-b border-border py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">Chmod Calculator</h1>
          <p className="text-body text-textMuted">Compute Unix file permissions and chmod commands</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <Button key={p.value} variant="outline" size="sm" onClick={() => setPerms(permsFromOctal(p.value))}>
                {p.label}
              </Button>
            ))}
          </div>

          <div className="overflow-x-auto border border-border rounded-lg">
            <table className="w-full text-control">
              <thead className="bg-surface border-b border-border">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium text-text">Who</th>
                  {PERM_BITS.map((b) => (
                    <th key={b.key} className="px-4 py-2.5 font-medium text-text text-center">
                      {b.label} ({b.value})
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GROUPS.map((g) => (
                  <tr key={g.key} className="border-t border-border bg-input">
                    <td className="px-4 py-3 text-text">{g.label}</td>
                    {PERM_BITS.map((b) => (
                      <td key={b.key} className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={perms[g.key][b.key]}
                          onChange={() => toggle(g.key, b.key)}
                          className="h-4 w-4 accent-[var(--primary)]"
                          aria-label={`${g.label} ${b.label}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { key: 'octal', label: 'Octal', value: octal, editable: true },
              { key: 'symbolic', label: 'Symbolic', value: symbolic },
              { key: 'command', label: 'Command', value: command },
            ].map((item) => (
              <div key={item.key} className="border border-border rounded-lg overflow-hidden">
                <div className="bg-surface px-3 py-2 border-b border-border flex justify-between items-center">
                  <span className="text-micro font-medium text-textMuted">{item.label}</span>
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(item.key, item.value)}>
                    {copied === item.key ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                {item.editable ? (
                  <input
                    type="text"
                    value={octal}
                    onChange={(e) => setOctalInput(e.target.value)}
                    className="w-full p-3 font-mono text-body text-text bg-input focus:outline-none focus:ring-2 focus:ring-focus-ring"
                    maxLength={3}
                  />
                ) : (
                  <div className="p-3 font-mono text-body text-text bg-input break-all">{item.value}</div>
                )}
              </div>
            ))}
          </div>

          <ul className="text-control text-textMuted space-y-1">
            {descriptions.map((line) => (
              <li key={line}>• {line}</li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
