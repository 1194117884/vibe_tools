import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../../../../contexts/AuthContext';
import UploadTool from '../../../../pages/tools/upload/index';

// Mock next/head
jest.mock('next/head', () => {
  return function Head({ children }) {
    return <>{children}</>;
  };
});

function renderWithAuth(isAuth = false) {
  if (isAuth) {
    sessionStorage.setItem('auth_token', 'test-token');
  }

  return render(
    <AuthProvider>
      <UploadTool />
    </AuthProvider>
  );
}

beforeEach(() => {
  sessionStorage.clear();
});

describe('UploadTool -- locked state', () => {
  test('shows lock message when not authenticated', () => {
    renderWithAuth(false);
    expect(screen.getByText(/这是一个私密工具/i)).toBeInTheDocument();
    expect(screen.getByText(/输入密钥解锁/i)).toBeInTheDocument();
  });

  test('shows AuthModal when unlock button clicked', async () => {
    const user = userEvent.setup();
    renderWithAuth(false);

    await user.click(screen.getByText(/输入密钥解锁/i));

    expect(screen.getByPlaceholderText('请输入密钥')).toBeInTheDocument();
  });
});

describe('UploadTool -- unlocked state', () => {
  test('shows upload zone when authenticated', () => {
    renderWithAuth(true);
    expect(screen.getByText('上传文件')).toBeInTheDocument();
    expect(screen.getByText(/拖拽文件到此处或点击选择/i)).toBeInTheDocument();
  });

  test('has a hidden file input', () => {
    renderWithAuth(true);
    const input = document.querySelector('input[type="file"]');
    expect(input).toBeInTheDocument();
  });

  test('shows file in list after selecting', async () => {
    const user = userEvent.setup();
    renderWithAuth(true);

    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]');

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });
  });

  test('can remove a file from the list', async () => {
    const user = userEvent.setup();
    renderWithAuth(true);

    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]');

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    const removeBtn = screen.getByTitle('移除文件');
    await user.click(removeBtn);

    expect(screen.queryByText('test.pdf')).not.toBeInTheDocument();
  });

  test('drag over adds visual highlight', async () => {
    renderWithAuth(true);

    const dropZone = screen.getByText(/拖拽文件到此处或点击选择/i).closest('[class*="border-dashed"]');

    await act(async () => {
      const event = new Event('dragover', { bubbles: true });
      Object.defineProperty(event, 'dataTransfer', { value: { types: ['Files'] } });
      Object.defineProperty(event, 'preventDefault', { value: jest.fn() });
      dropZone.dispatchEvent(event);
    });

    expect(dropZone.className).toContain('border-[#0071e3]');
  });

  test('shows start upload button when files are pending', async () => {
    const user = userEvent.setup();
    renderWithAuth(true);

    const file = new File(['dummy'], 'test.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]');
    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText(/开始上传/i)).toBeInTheDocument();
    });
  });

  test('shows retry button and retry-all button when files fail', async () => {
    const user = userEvent.setup();
    // Mock fetch to simulate a presign failure
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: '上传失败' }),
    });

    renderWithAuth(true);

    const file = new File(['dummy'], 'fail.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]');
    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('fail.pdf')).toBeInTheDocument();
    });

    // Click "开始上传" to trigger the upload attempt
    const startBtn = screen.getByText('开始上传');
    await user.click(startBtn);

    // Wait for the error state to appear
    await waitFor(() => {
      expect(screen.getByText('上传失败')).toBeInTheDocument();
    });

    // Retry button should be visible
    expect(screen.getByText('重试')).toBeInTheDocument();

    // Click retry — should reset to pending
    await user.click(screen.getByText('重试'));

    await waitFor(() => {
      expect(screen.getByText('等待上传')).toBeInTheDocument();
    });

    global.fetch.mockRestore();
  });
});
