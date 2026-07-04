import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PasteDownloadTool, {
  getExtensionFromMime,
  getReadableSize,
} from '../../../../pages/tools/paste-download/index';

jest.mock('next/head', () => {
  return function Head({ children }) {
    return <>{children}</>;
  };
});

beforeEach(() => {
  URL.createObjectURL = jest.fn(() => 'blob:clipboard-item');
  URL.revokeObjectURL = jest.fn();
});

describe('PasteDownloadTool', () => {
  test('maps common mime types to useful extensions', () => {
    expect(getExtensionFromMime('image/png')).toBe('png');
    expect(getExtensionFromMime('image/jpeg')).toBe('jpg');
    expect(getExtensionFromMime('application/x-custom')).toBe('x-custom');
    expect(getExtensionFromMime('')).toBe('bin');
  });

  test('formats readable file sizes', () => {
    expect(getReadableSize(512)).toBe('512 B');
    expect(getReadableSize(2048)).toBe('2.0 KB');
    expect(getReadableSize(2 * 1024 * 1024)).toBe('2.0 MB');
  });

  test('adds pasted image file to the download list', async () => {
    render(<PasteDownloadTool />);

    const file = new File(['image bytes'], 'screen.png', { type: 'image/png' });
    const pasteArea = screen.getByLabelText('Paste clipboard file area');

    fireEvent.paste(pasteArea, {
      clipboardData: {
        items: [
          {
            kind: 'file',
            getAsFile: () => file,
          },
        ],
        files: [file],
      },
    });

    await waitFor(() => {
      expect(screen.getByText('screen.png')).toBeInTheDocument();
    });
    expect(screen.getByText('image/png · 11 B ·', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('1 item ready to download.')).toBeInTheDocument();
  });

  test('turns pasted plain text into a downloadable text file', async () => {
    render(<PasteDownloadTool />);

    fireEvent.paste(screen.getByLabelText('Paste clipboard file area'), {
      clipboardData: {
        items: [
          {
            kind: 'string',
            type: 'text/plain',
            getAsString: (callback) => callback('hello clipboard'),
          },
        ],
        files: [],
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/clipboard-.*\.txt/)).toBeInTheDocument();
    });
    expect(screen.getByText('text/plain · 15 B ·', { exact: false })).toBeInTheDocument();
  });

  test('turns pasted html into a downloadable html file', async () => {
    render(<PasteDownloadTool />);

    fireEvent.paste(screen.getByLabelText('Paste clipboard file area'), {
      clipboardData: {
        items: [
          {
            kind: 'string',
            type: 'text/html',
            getAsString: (callback) => callback('<strong>Hello</strong>'),
          },
        ],
        files: [],
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/clipboard-.*\.html/)).toBeInTheDocument();
    });
    expect(screen.getByText('text/html · 22 B ·', { exact: false })).toBeInTheDocument();
  });

  test('uses clipboard plain text fallback when items are unavailable', async () => {
    render(<PasteDownloadTool />);

    fireEvent.paste(screen.getByLabelText('Paste clipboard file area'), {
      clipboardData: {
        items: [],
        files: [],
        getData: (type) => (type === 'text/plain' ? 'fallback text' : ''),
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/clipboard-.*\.txt/)).toBeInTheDocument();
    });
  });

  test('shows an unsupported clipboard error for empty private data', () => {
    render(<PasteDownloadTool />);

    fireEvent.paste(screen.getByLabelText('Paste clipboard file area'), {
      clipboardData: {
        items: [],
        files: [],
        getData: () => '',
      },
    });

    expect(screen.getByRole('alert')).toHaveTextContent('Clipboard data is empty or uses a private format');
  });

  test('removes a pasted item', async () => {
    const user = userEvent.setup();
    render(<PasteDownloadTool />);

    const file = new File(['pdf'], 'note.pdf', { type: 'application/pdf' });
    fireEvent.paste(screen.getByLabelText('Paste clipboard file area'), {
      clipboardData: {
        items: [{ kind: 'file', getAsFile: () => file }],
        files: [file],
      },
    });

    await waitFor(() => {
      expect(screen.getByText('note.pdf')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Remove'));

    expect(screen.queryByText('note.pdf')).not.toBeInTheDocument();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:clipboard-item');
  });
});
