import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PasswordTool, {
  generateStrongPassword,
  getPasswordStrength,
} from '../../../../pages/tools/password/index';

jest.mock('next/head', () => {
  return function Head({ children }) {
    return <>{children}</>;
  };
});

const deterministicCrypto = {
  current: 0,
  getRandomValues(bytes) {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = this.current % 256;
      this.current += 1;
    }
    return bytes;
  },
};

beforeEach(() => {
  deterministicCrypto.current = 0;
  Object.defineProperty(global, 'crypto', {
    configurable: true,
    value: deterministicCrypto,
  });
  window.alert = jest.fn();
});

describe('PasswordTool', () => {
  test('generates a password with all selected character types', () => {
    const password = generateStrongPassword(
      16,
      { lowercase: true, uppercase: true, numbers: true, symbols: true },
      deterministicCrypto
    );

    expect(password).toHaveLength(16);
    expect(password).toMatch(/[a-z]/);
    expect(password).toMatch(/[A-Z]/);
    expect(password).toMatch(/[0-9]/);
    expect(password).toMatch(/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/);
  });

  test('rates password strength with more than three common levels', () => {
    expect(getPasswordStrength('abc').label).toBe('Very weak');
    expect(getPasswordStrength('abcdefgh').label).toBe('Weak');
    expect(getPasswordStrength('abcdefghijklmnop').label).toBe('Fair');
    expect(getPasswordStrength('Abcdefghijklmnop1').label).toBe('Good');
    expect(getPasswordStrength('Abcdefghijklmnop1!').label).toBe('Strong');
  });

  test('supports generating a numbers-only password from the UI', async () => {
    const user = userEvent.setup();
    render(<PasswordTool />);

    await user.click(screen.getByLabelText('Lowercase (a-z)'));
    await user.click(screen.getByLabelText('Uppercase (A-Z)'));
    await user.click(screen.getByLabelText('Symbols (!@#$)'));
    await user.clear(screen.getByRole('spinbutton'));
    await user.type(screen.getByRole('spinbutton'), '12');
    await user.click(screen.getByText('Generate Password'));

    const result = screen.getByText(/[0-9]{12}/);
    expect(result.textContent.trim()).toMatch(/^[0-9]{12}$/);
    expect(screen.getByText('Strength')).toBeInTheDocument();
    expect(screen.getByText('Fair')).toBeInTheDocument();
  });

  test('shows an error when no character type is selected', async () => {
    const user = userEvent.setup();
    render(<PasswordTool />);

    await user.click(screen.getByLabelText('Lowercase (a-z)'));
    await user.click(screen.getByLabelText('Uppercase (A-Z)'));
    await user.click(screen.getByLabelText('Numbers (0-9)'));
    await user.click(screen.getByLabelText('Symbols (!@#$)'));
    await user.click(screen.getByText('Generate Password'));

    expect(screen.getByText('Select at least one character type.')).toBeInTheDocument();
  });
});
