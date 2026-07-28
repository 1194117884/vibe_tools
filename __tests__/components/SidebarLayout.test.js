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

describe('SidebarLayout categories', () => {
  test('renders category group labels in the menu', () => {
    renderLayout();
    // Labels appear in desktop + mobile nav (duplicate nodes ok)
    expect(screen.getAllByText('Format & Diff').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Crypto').length).toBeGreaterThan(0);
    expect(screen.getAllByText('DevOps').length).toBeGreaterThan(0);
  });

  test('toggles a category group and persists collapsed state', async () => {
    const user = userEvent.setup();
    renderLayout();

    // Tools under Crypto are visible by default (desktop + mobile = multiple)
    expect(screen.getAllByText('Hash Generator').length).toBeGreaterThan(0);

    const cryptoHeaders = screen.getAllByRole('button', { name: /crypto/i });
    await user.click(cryptoHeaders[0]);

    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem('sidebar_category_collapsed')).crypto).toBe(true);
    });

    // After collapse, tools under Crypto should not appear in that expanded nav
    // Mobile + desktop both update — neither should list Hash Generator
    expect(screen.queryByText('Hash Generator')).not.toBeInTheDocument();

    // Expand again
    await user.click(cryptoHeaders[0]);
    expect(screen.getAllByText('Hash Generator').length).toBeGreaterThan(0);
  });
});

describe('SidebarLayout protected menu', () => {
  test('does not show protected tools before hidden trigger is activated', () => {
    renderLayout();
    expect(screen.queryByText('Upload Files')).not.toBeInTheDocument();
    expect(screen.queryByText('Douyin Proxy')).not.toBeInTheDocument();
    expect(screen.queryByText('Private')).not.toBeInTheDocument();
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
    expect(screen.getAllByText('Private').length).toBeGreaterThan(0);
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
