import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ToolSearch, { ToolSearchTrigger } from '../../components/ToolSearch';

const mockPush = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',
    push: mockPush,
  }),
}));

beforeEach(() => {
  mockPush.mockClear();
});

describe('ToolSearch', () => {
  test('opens on Meta+K and shows tools', async () => {
    render(<ToolSearch />);

    expect(screen.queryByRole('dialog', { name: 'Search tools' })).not.toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'k', metaKey: true });

    expect(await screen.findByRole('dialog', { name: 'Search tools' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search tools by name or description/i)).toBeInTheDocument();
    expect(screen.getByText('JSON Formatter')).toBeInTheDocument();
  });

  test('opens on Ctrl+K', async () => {
    render(<ToolSearch />);
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(await screen.findByRole('dialog', { name: 'Search tools' })).toBeInTheDocument();
  });

  test('filters by name and description', async () => {
    const user = userEvent.setup();
    render(<ToolSearch />);
    fireEvent.keyDown(window, { key: 'k', metaKey: true });

    const input = await screen.findByPlaceholderText(/search tools by name or description/i);
    await user.type(input, 'morse');

    expect(screen.getByText('Morse Code')).toBeInTheDocument();
    expect(screen.queryByText('JSON Formatter')).not.toBeInTheDocument();

    await user.clear(input);
    await user.type(input, 'symmetric encryption');
    expect(screen.getByText('AES Encrypt')).toBeInTheDocument();
  });

  test('navigates on Enter', async () => {
    const user = userEvent.setup();
    render(<ToolSearch />);
    fireEvent.keyDown(window, { key: 'k', metaKey: true });

    const input = await screen.findByPlaceholderText(/search tools by name or description/i);
    await user.type(input, 'jwt');
    await user.keyboard('{Enter}');

    expect(mockPush).toHaveBeenCalledWith('/tools/jwt');
  });

  test('closes on Escape', async () => {
    render(<ToolSearch />);
    fireEvent.keyDown(window, { key: 'k', metaKey: true });

    expect(await screen.findByRole('dialog', { name: 'Search tools' })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: 'Search tools' })).not.toBeInTheDocument();
  });

  test('hides protected tools unless protectedVisible', async () => {
    const { rerender } = render(<ToolSearch protectedVisible={false} />);
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    await screen.findByRole('dialog', { name: 'Search tools' });
    expect(screen.queryByText('Upload Files')).not.toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'k', metaKey: true }); // close
    rerender(<ToolSearch protectedVisible />);
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(await screen.findByText('Upload Files')).toBeInTheDocument();
  });

  test('trigger button opens search via custom event', async () => {
    const user = userEvent.setup();
    render(
      <>
        <ToolSearchTrigger />
        <ToolSearch />
      </>
    );

    await user.click(screen.getByRole('button', { name: 'Search tools' }));
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Search tools' })).toBeInTheDocument();
    });
  });
});
