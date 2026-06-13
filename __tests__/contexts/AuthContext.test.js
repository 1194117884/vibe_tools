import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';

function TestConsumer() {
  const { isAuthenticated, verify, clearAuth } = useAuth();
  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? 'true' : 'false'}</span>
      <button data-testid="verify-btn" onClick={() => verify('test-key')}>
        Verify
      </button>
      <button data-testid="clear-btn" onClick={clearAuth}>
        Clear
      </button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );
}

beforeEach(() => {
  sessionStorage.clear();
  jest.restoreAllMocks();
});

describe('AuthContext', () => {
  test('default isAuthenticated is false', () => {
    renderWithProvider();
    expect(screen.getByTestId('auth-status').textContent).toBe('false');
  });

  test('sets isAuthenticated to true after successful verify', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'test-jwt-token' }),
    });

    renderWithProvider();
    const btn = screen.getByTestId('verify-btn');
    await act(async () => {
      btn.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('true');
    });
  });

  test('stores token in sessionStorage on success', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'test-jwt-token' }),
    });

    renderWithProvider();
    const btn = screen.getByTestId('verify-btn');
    await act(async () => {
      btn.click();
    });

    await waitFor(() => {
      expect(sessionStorage.getItem('auth_token')).toBe('test-jwt-token');
    });
  });

  test('does NOT set isAuthenticated on failed verify', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: '密钥不正确' }),
    });

    renderWithProvider();
    const btn = screen.getByTestId('verify-btn');
    await act(async () => {
      btn.click();
    });

    expect(screen.getByTestId('auth-status').textContent).toBe('false');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('returns error message on failed verify', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: '密钥不正确' }),
    });

    let capturedError;
    function TestErrorConsumer() {
      const { isAuthenticated, verify } = useAuth();
      return (
        <div>
          <span data-testid="auth-status">{isAuthenticated ? 'true' : 'false'}</span>
          <button
            data-testid="verify-btn"
            onClick={async () => {
              capturedError = await verify('wrong-key');
            }}
          >
            Verify
          </button>
        </div>
      );
    }

    render(
      <AuthProvider>
        <TestErrorConsumer />
      </AuthProvider>
    );

    const btn = screen.getByTestId('verify-btn');
    await act(async () => {
      btn.click();
    });

    await waitFor(() => {
      expect(capturedError).toBe('密钥不正确');
    });
  });

  test('clearAuth removes token and sets isAuthenticated to false', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'test-jwt-token' }),
    });

    renderWithProvider();

    const verifyBtn = screen.getByTestId('verify-btn');
    await act(async () => {
      verifyBtn.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('true');
    });

    const clearBtn = screen.getByTestId('clear-btn');
    await act(async () => {
      clearBtn.click();
    });

    expect(screen.getByTestId('auth-status').textContent).toBe('false');
    expect(sessionStorage.getItem('auth_token')).toBeNull();
  });

  test('restores auth state from sessionStorage on mount', () => {
    sessionStorage.setItem('auth_token', 'existing-token');
    renderWithProvider();
    expect(screen.getByTestId('auth-status').textContent).toBe('true');
  });

  test('handles network error during verify', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));

    let capturedError;
    function TestNetworkConsumer() {
      const { verify } = useAuth();
      return (
        <button
          data-testid="verify-btn"
          onClick={async () => {
            capturedError = await verify('test-key');
          }}
        >
          Verify
        </button>
      );
    }

    render(
      <AuthProvider>
        <TestNetworkConsumer />
      </AuthProvider>
    );

    const btn = screen.getByTestId('verify-btn');
    await act(async () => {
      btn.click();
    });

    expect(capturedError).toBe('验证服务暂时不可用，请稍后再试');
  });
});
