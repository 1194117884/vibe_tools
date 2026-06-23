import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RequestTool from '../../../../pages/tools/request/index';

jest.mock('next/head', () => {
  return function Head({ children }) {
    return <>{children}</>;
  };
});

const sampleCurl = `curl 'https://example.com/api/path?aweme_id=7654442329285086479&a_bogus=remove_me' \\
-X 'GET' \\
-H 'Accept: application/json' \\
-H 'Cookie: sid=demo'`;

let writeTextMock;

beforeEach(() => {
  writeTextMock = jest.fn().mockResolvedValue(undefined);
  window.alert = jest.fn();
});

describe('RequestTool', () => {
  test('parses curl into editable request parts', async () => {
    const user = userEvent.setup();
    render(<RequestTool />);

    await user.type(screen.getByPlaceholderText(/Paste curl/i), sampleCurl);
    await user.click(screen.getByText('Parse'));

    expect(screen.getByDisplayValue('example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('/api/path')).toBeInTheDocument();
    expect(screen.getByDisplayValue('aweme_id')).toBeInTheDocument();
    expect(screen.getByDisplayValue('7654442329285086479')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Cookie')).toBeInTheDocument();
  });

  test('can disable a query parameter and copy rebuilt URL', async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: writeTextMock,
      },
    });
    render(<RequestTool />);

    await user.type(screen.getByPlaceholderText(/Paste curl/i), sampleCurl);
    await user.click(screen.getByText('Parse'));

    const bogusInput = screen.getByDisplayValue('a_bogus');
    const row = bogusInput.closest('.grid');
    await user.click(within(row).getByRole('checkbox'));

    const rebuiltUrlPanel = screen.getByText('Rebuilt URL').closest('section');
    expect(within(rebuiltUrlPanel).getByText(/aweme_id=7654442329285086479/)).toBeInTheDocument();
    expect(within(rebuiltUrlPanel).queryByText(/a_bogus/)).not.toBeInTheDocument();

    await user.click(within(rebuiltUrlPanel).getByText('Copy'));
    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith(
        expect.stringContaining('aweme_id=7654442329285086479')
      );
    });
  });
});
