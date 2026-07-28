import { escapeCsvField, jsonToCsv } from '../../../pages/tools/json-csv';

describe('jsonToCsv', () => {
  test('converts array of objects with header', () => {
    const csv = jsonToCsv(
      JSON.stringify([
        { id: 1, name: 'Ada' },
        { id: 2, name: 'Grace' },
      ])
    );
    expect(csv).toBe('id,name\n1,Ada\n2,Grace');
  });

  test('escapes quotes and commas', () => {
    expect(escapeCsvField('a,b')).toBe('"a,b"');
    expect(escapeCsvField('say "hi"')).toBe('"say ""hi"""');
    const csv = jsonToCsv('[{"name":"Lin, T","note":"x"}]');
    expect(csv).toContain('"Lin, T"');
  });

  test('single object becomes one row', () => {
    const csv = jsonToCsv('{"a":1,"b":2}');
    expect(csv).toBe('a,b\n1,2');
  });

  test('without header', () => {
    const csv = jsonToCsv('[{"x":1}]', { includeHeader: false });
    expect(csv).toBe('1');
  });

  test('rejects invalid shapes', () => {
    expect(() => jsonToCsv('')).toThrow(/enter/i);
    expect(() => jsonToCsv('123')).toThrow(/array or an object/i);
    expect(() => jsonToCsv('[1,2]')).toThrow(/plain object/i);
  });
});
