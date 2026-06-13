import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthModal from '../../components/AuthModal';

describe('AuthModal', () => {
  test('renders the modal with input and button', () => {
    render(<AuthModal open={true} />);
    expect(screen.getByPlaceholderText('请输入密钥')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /解锁/i })).toBeInTheDocument();
  });

  test('does not render when open is false', () => {
    render(<AuthModal open={false} />);
    expect(screen.queryByPlaceholderText('请输入密钥')).not.toBeInTheDocument();
  });

  test('calls onVerify with entered key when button clicked', async () => {
    const user = userEvent.setup();
    const onVerify = jest.fn();

    render(<AuthModal open={true} onVerify={onVerify} />);

    const input = screen.getByPlaceholderText('请输入密钥');
    await user.type(input, 'my-secret-key');
    await user.click(screen.getByRole('button', { name: /解锁/i }));

    expect(onVerify).toHaveBeenCalledWith('my-secret-key');
  });

  test('calls onVerify when Enter key is pressed', async () => {
    const user = userEvent.setup();
    const onVerify = jest.fn();

    render(<AuthModal open={true} onVerify={onVerify} />);

    const input = screen.getByPlaceholderText('请输入密钥');
    await user.type(input, 'enter-key');
    await user.keyboard('{Enter}');

    expect(onVerify).toHaveBeenCalledWith('enter-key');
  });

  test('does not call onVerify for empty input', async () => {
    const user = userEvent.setup();
    const onVerify = jest.fn();

    render(<AuthModal open={true} onVerify={onVerify} />);

    await user.click(screen.getByRole('button', { name: /解锁/i }));
    expect(onVerify).not.toHaveBeenCalled();
  });

  test('shows error message when error prop is provided', () => {
    render(<AuthModal open={true} error="密钥不正确" />);
    expect(screen.getByText('密钥不正确')).toBeInTheDocument();
  });

  test('shows loading state when loading prop is true', () => {
    render(<AuthModal open={true} loading={true} />);
    const btn = screen.getByRole('button', { name: /验证中/i });
    expect(btn).toBeDisabled();
  });

  test('disables input when loading', () => {
    render(<AuthModal open={true} loading={true} />);
    expect(screen.getByPlaceholderText('请输入密钥')).toBeDisabled();
  });

  test('clears input when modal reopens', async () => {
    const user = userEvent.setup();

    const { rerender } = render(<AuthModal open={true} />);

    const input = screen.getByPlaceholderText('请输入密钥');
    await user.type(input, 'old-key');

    // Close and reopen
    rerender(<AuthModal open={false} />);
    rerender(<AuthModal open={true} />);

    // Input should be cleared
    expect(screen.getByPlaceholderText('请输入密钥').value).toBe('');
  });

  test('calls onClose when clicking the backdrop', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(<AuthModal open={true} onClose={onClose} />);

    // Click the backdrop (the parent of the dialog)
    const backdrop = screen.getByRole('dialog').parentElement;
    await user.click(backdrop);

    expect(onClose).toHaveBeenCalled();
  });
});
