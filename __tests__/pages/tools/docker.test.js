import { dockerRunToCompose, tokenize } from '../../../pages/tools/docker';

describe('tokenize', () => {
  test('handles quotes and escapes', () => {
    expect(tokenize(`docker run -e FOO="bar baz" image`)).toEqual([
      'docker',
      'run',
      '-e',
      'FOO=bar baz',
      'image',
    ]);
  });
});

describe('dockerRunToCompose', () => {
  test('converts a typical docker run command', () => {
    const yaml = dockerRunToCompose(
      'docker run -d --name redis -p 6379:6379 -v data:/data -e PASS=secret --restart unless-stopped redis:7 redis-server'
    );
    expect(yaml).toContain('image: redis:7');
    expect(yaml).toContain('container_name: redis');
    expect(yaml).toContain('6379:6379');
    expect(yaml).toContain('data:/data');
    expect(yaml).toContain('PASS=secret');
    expect(yaml).toContain('restart: unless-stopped');
    expect(yaml).toContain('redis-server');
  });

  test('throws without an image', () => {
    expect(() => dockerRunToCompose('docker run -d')).toThrow(/image/i);
  });
});
