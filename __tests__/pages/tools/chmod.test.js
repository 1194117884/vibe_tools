import {
  octalFromPerms,
  permsFromOctal,
  symbolicFromPerms,
} from '../../../pages/tools/chmod';

describe('chmod calculator', () => {
  test('755 round-trips', () => {
    const perms = permsFromOctal('755');
    expect(octalFromPerms(perms)).toBe('755');
    expect(symbolicFromPerms(perms)).toBe('-rwxr-xr-x');
  });

  test('644 symbolic', () => {
    expect(symbolicFromPerms(permsFromOctal(644))).toBe('-rw-r--r--');
  });

  test('000 is no permissions', () => {
    const perms = permsFromOctal('000');
    expect(octalFromPerms(perms)).toBe('000');
    expect(symbolicFromPerms(perms)).toBe('----------');
  });
});
