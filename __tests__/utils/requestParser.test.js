import { buildCurl, buildUrl, parseRequestInput, tokenizeShell } from '../../utils/requestParser';

const demoCurl = `curl 'https://www-hj.douyin.com/aweme/v1/web/aweme/detail/?device_platform=webapp&aid=6383&aweme_id=7654442329285086479&a_bogus=df0V6FSw%2Ftest%3D%3D&verifyFp=verify_demo' \\
-X 'GET' \\
-H 'Pragma: no-cache' \\
-H 'Accept: application/json, text/plain, */*' \\
-H 'Cookie: sessionid=demo; uid_tt=demo-user' \\
-H 'uifid: demo-uifid'`;

describe('requestParser', () => {
  test('tokenizes quoted curl with line continuations', () => {
    const tokens = tokenizeShell(demoCurl);

    expect(tokens[0]).toBe('curl');
    expect(tokens).toContain('-X');
    expect(tokens).toContain('GET');
    expect(tokens).toContain('Cookie: sessionid=demo; uid_tt=demo-user');
  });

  test('parses curl URL, query parameters, method, and headers', () => {
    const parsed = parseRequestInput(demoCurl);

    expect(parsed.method).toBe('GET');
    expect(parsed.protocol).toBe('https');
    expect(parsed.host).toBe('www-hj.douyin.com');
    expect(parsed.path).toBe('/aweme/v1/web/aweme/detail/');
    expect(parsed.query).toEqual(
      expect.arrayContaining([
        { key: 'device_platform', value: 'webapp', enabled: true },
        { key: 'aweme_id', value: '7654442329285086479', enabled: true },
        { key: 'a_bogus', value: 'df0V6FSw/test==', enabled: true },
      ])
    );
    expect(parsed.headers).toEqual(
      expect.arrayContaining([
        { key: 'Accept', value: 'application/json, text/plain, */*', enabled: true },
        { key: 'Cookie', value: 'sessionid=demo; uid_tt=demo-user', enabled: true },
      ])
    );
  });

  test('rebuilds URL without disabled query parameters', () => {
    const parsed = parseRequestInput(demoCurl);
    const next = {
      ...parsed,
      query: parsed.query.map((param) =>
        param.key === 'a_bogus' ? { ...param, enabled: false } : param
      ),
    };

    const rebuilt = buildUrl(next);

    expect(rebuilt).toContain('aweme_id=7654442329285086479');
    expect(rebuilt).not.toContain('a_bogus=');
  });

  test('rebuilds curl without disabled headers', () => {
    const parsed = parseRequestInput(demoCurl);
    const next = {
      ...parsed,
      headers: parsed.headers.map((header) =>
        header.key === 'Cookie' ? { ...header, enabled: false } : header
      ),
    };

    const rebuilt = buildCurl(next);

    expect(rebuilt).toContain("-X 'GET'");
    expect(rebuilt).toContain("'Accept: application/json, text/plain, */*'");
    expect(rebuilt).not.toContain('Cookie:');
  });

  test('parses form data and rebuilds POST curl', () => {
    const parsed = parseRequestInput("curl 'https://example.com/api' -H 'Content-Type: application/x-www-form-urlencoded' --data-raw 'a=1&b=two'");

    expect(parsed.method).toBe('POST');
    expect(parsed.bodyParams).toEqual([
      { key: 'a', value: '1', enabled: true },
      { key: 'b', value: 'two', enabled: true },
    ]);
    const rebuilt = buildCurl(parsed);
    expect(rebuilt).toContain("--data-raw 'a=1&b=two'");
  });
});
