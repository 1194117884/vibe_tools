import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SidebarLayout from '../../components/SidebarLayout';
import { AuthProvider } from '../../contexts/AuthContext';

jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',
    push: jest.fn(),
  }),
}));

jest.mock('../../components/ThemeToggle', () => {
  return function ThemeToggle() {
    return <button type="button">Theme</button>;
  };
});

function renderLayout() {
  return render(
    <AuthProvider>
      <SidebarLayout>
        <main>Content</main>
      </SidebarLayout>
    </AuthProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('SidebarLayout protected menu', () => {
  test('does not show protected tools before hidden trigger is activated', () => {
    renderLayout();
    expect(screen.queryByText('Upload Files')).not.toBeInTheDocument();
    expect(screen.queryByText('Douyin Proxy')).not.toBeInTheDocument();
  });

  test('shows protected tools and stores visibility after 5 hidden clicks', async () => {
    const user = userEvent.setup();
    renderLayout();

    const trigger = screen.getByText('·');
    for (let i = 0; i < 5; i++) {
      await user.click(trigger);
    }

    expect(screen.getByText('Upload Files')).toBeInTheDocument();
    expect(screen.getByText('Douyin Proxy')).toBeInTheDocument();
    expect(localStorage.getItem('protected_tools_menu_visible')).toBe('true');
  });

  test('restores protected tools from localStorage', async () => {
    localStorage.setItem('protected_tools_menu_visible', 'true');
    renderLayout();

    await waitFor(() => {
      expect(screen.getByText('Upload Files')).toBeInTheDocument();
      expect(screen.getByText('Douyin Proxy')).toBeInTheDocument();
    });
  });
});
