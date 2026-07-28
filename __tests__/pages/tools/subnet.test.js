import { intToIp, ipToInt, parseCidr } from '../../../pages/tools/subnet';

describe('IPv4 helpers', () => {
  test('ipToInt / intToIp round-trip', () => {
    expect(intToIp(ipToInt('192.168.1.10'))).toBe('192.168.1.10');
    expect(ipToInt('0.0.0.0')).toBe(0);
    expect(ipToInt('255.255.255.255')).toBe(4294967295);
  });

  test('parseCidr /24 network', () => {
    const info = parseCidr('192.168.1.10/24');
    expect(info.network).toBe('192.168.1.0');
    expect(info.broadcast).toBe('192.168.1.255');
    expect(info.netmask).toBe('255.255.255.0');
    expect(info.firstHost).toBe('192.168.1.1');
    expect(info.lastHost).toBe('192.168.1.254');
    expect(info.hostCount).toBe(254);
    expect(info.cidr).toBe('192.168.1.0/24');
  });

  test('parseCidr accepts netmask form', () => {
    const info = parseCidr('10.0.0.5 255.255.255.0');
    expect(info.network).toBe('10.0.0.0');
    expect(info.prefix).toBe(24);
  });

  test('rejects invalid prefix', () => {
    expect(() => parseCidr('1.2.3.4/99')).toThrow(/prefix/i);
  });
});
