import { jsonToYaml, yamlToJson } from '../../../pages/tools/yaml';

describe('YAML ↔ JSON', () => {
  test('yaml to json', () => {
    const json = yamlToJson('name: vibe\ncount: 2\nlist:\n  - a\n  - b');
    const data = JSON.parse(json);
    expect(data.name).toBe('vibe');
    expect(data.count).toBe(2);
    expect(data.list).toEqual(['a', 'b']);
  });

  test('json to yaml and back', () => {
    const yaml = jsonToYaml('{"hello":"world","n":1}');
    expect(yaml).toMatch(/hello:\s*world/);
    const again = JSON.parse(yamlToJson(yaml));
    expect(again).toEqual({ hello: 'world', n: 1 });
  });

  test('invalid json throws', () => {
    expect(() => jsonToYaml('{nope')).toThrow();
  });
});
