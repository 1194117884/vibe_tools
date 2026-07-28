import { useMemo, useState } from 'react';
import Head from 'next/head';
import { Button } from '../../../components/ui/button';

export function ipToInt(ip) {
  const parts = ip.trim().split('.');
  if (parts.length !== 4) throw new Error('IPv4 must have 4 octets.');
  let n = 0;
  for (const part of parts) {
    if (!/^\d+$/.test(part)) throw new Error(`Invalid octet: ${part}`);
    const v = Number(part);
    if (v < 0 || v > 255) throw new Error(`Octet out of range: ${part}`);
    n = (n << 8) + v;
  }
  return n >>> 0;
}

export function intToIp(n) {
  return [
    (n >>> 24) & 255,
    (n >>> 16) & 255,
    (n >>> 8) & 255,
    n & 255,
  ].join('.');
}

export function parseCidr(input) {
  const raw = input.trim();
  let ip;
  let prefix;

  if (raw.includes('/')) {
    const [a, b] = raw.split('/');
    ip = a.trim();
    prefix = Number(b);
  } else if (raw.includes(' ')) {
    // "192.168.1.0 255.255.255.0"
    const [a, mask] = raw.split(/\s+/);
    ip = a;
    prefix = maskToPrefix(mask);
  } else {
    ip = raw;
    prefix = 24;
  }

  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
    throw new Error('Prefix must be an integer between 0 and 32.');
  }

  const ipInt = ipToInt(ip);
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const network = (ipInt & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const hostCount = prefix === 32 ? 1 : prefix === 31 ? 2 : broadcast - network - 1;
  const firstHost = prefix >= 31 ? network : (network + 1) >>> 0;
  const lastHost = prefix >= 31 ? broadcast : (broadcast - 1) >>> 0;

  return {
    inputIp: intToIp(ipInt),
    prefix,
    netmask: intToIp(mask),
    wildcard: intToIp((~mask) >>> 0),
    network: intToIp(network),
    broadcast: intToIp(broadcast),
    firstHost: intToIp(firstHost),
    lastHost: intToIp(lastHost),
    hostCount: Math.max(0, hostCount),
    totalAddresses: 2 ** (32 - prefix),
    cidr: `${intToIp(network)}/${prefix}`,
  };
}

export function maskToPrefix(mask) {
  const n = ipToInt(mask);
  const bits = n.toString(2).padStart(32, '0');
  if (!/^1*0*$/.test(bits)) throw new Error('Invalid netmask.');
  return bits.split('1').length - 1;
}

export default function SubnetTool() {
  const [input, setInput] = useState('192.168.1.10/24');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    try {
      return { data: parseCidr(input), error: null };
    } catch (e) {
      return { data: null, error: e.message };
    }
  }, [input]);

  const rows = result.data
    ? [
        ['CIDR', result.data.cidr],
        ['IP address', result.data.inputIp],
        ['Prefix length', String(result.data.prefix)],
        ['Netmask', result.data.netmask],
        ['Wildcard mask', result.data.wildcard],
        ['Network address', result.data.network],
        ['Broadcast address', result.data.broadcast],
        ['First host', result.data.firstHost],
        ['Last host', result.data.lastHost],
        ['Usable hosts', String(result.data.hostCount)],
        ['Total addresses', String(result.data.totalAddresses)],
      ]
    : [];

  const handleCopy = async () => {
    if (!result.data) return;
    const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>IPv4 Subnet - Vibe Tools</title>
        <meta name="description" content="IPv4 CIDR subnet calculator" />
      </Head>
      <header className="border-b border-border py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">IPv4 Subnet</h1>
          <p className="text-body text-textMuted">Calculate network, broadcast, hosts, and netmask from CIDR</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <div>
            <label className="block text-control font-medium text-text mb-2">
              IP / CIDR
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="192.168.1.0/24 or 10.0.0.1 255.255.255.0"
              className="w-full p-3 border border-border rounded bg-input text-text font-mono focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent transition-colors duration-150"
            />
            <p className="mt-1 text-micro text-textMuted">
              Accepts <code className="text-text">ip/prefix</code>, bare IP (defaults /24), or{' '}
              <code className="text-text">ip netmask</code>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', '192.168.1.0/24', '10.0.0.5/30'].map(
              (preset) => (
                <Button key={preset} variant="outline" size="sm" onClick={() => setInput(preset)}>
                  {preset}
                </Button>
              )
            )}
          </div>

          {result.error && (
            <div className="text-error text-control p-3 bg-errorBg rounded">{result.error}</div>
          )}

          {result.data && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-surface px-4 py-2.5 border-b border-border flex justify-between items-center">
                <h3 className="text-body-emphasis text-text">Subnet details</h3>
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <table className="w-full text-control">
                <tbody>
                  {rows.map(([label, value]) => (
                    <tr key={label} className="border-t border-border bg-input">
                      <td className="px-4 py-2.5 text-textMuted w-1/3">{label}</td>
                      <td className="px-4 py-2.5 font-mono text-text">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
