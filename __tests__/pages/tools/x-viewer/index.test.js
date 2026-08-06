import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../../../../contexts/AuthContext';
import XViewerTool from '../../../../pages/tools/x-viewer/index';

jest.mock('next/head', () => {
  return function Head({ children }) {
    return <>{children}</>;
  };
});

const EMBED_URL = 'https://x-viewer.qq1194117884.workers.dev';

function makeToken(payload) {
  const encode = (value) => btoa(JSON.stringify(value)).replace(/=/g, '');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.signature`;
}

function renderWithAuth(isAuth = false) {
  if (isAuth) {
    localStorage.setItem('auth_token', makeToken({ exp: Math.floor(Date.now() / 1000) + 3600 }));
  }

  return render(
    <AuthProvider>
      <XViewerTool />
    </AuthProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('XViewerTool', () => {
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

  test('embeds external viewer page when authenticated', () => {
    renderWithAuth(true);

    const iframe = screen.getByTitle('Unroll X');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', EMBED_URL);
  });
});
