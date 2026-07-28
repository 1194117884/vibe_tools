import { convertAll, splitWords, toCamelCase, toSnakeCase } from '../../../pages/tools/case';

describe('case converter', () => {
  test('splitWords handles mixed styles', () => {
    expect(splitWords('getUser_Name-id')).toEqual(['get', 'user', 'name', 'id']);
    expect(splitWords('HTTPServerError')).toEqual(['http', 'server', 'error']);
  });

  test('converts to camel and snake', () => {
    const words = splitWords('hello_world');
    expect(toCamelCase(words)).toBe('helloWorld');
    expect(toSnakeCase(words)).toBe('hello_world');
  });

  test('convertAll returns expected styles', () => {
    const all = convertAll('user profile id');
    expect(all.camel).toBe('userProfileId');
    expect(all.pascal).toBe('UserProfileId');
    expect(all.snake).toBe('user_profile_id');
    expect(all.kebab).toBe('user-profile-id');
    expect(all.constant).toBe('USER_PROFILE_ID');
  });
});
