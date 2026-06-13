import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HiddenTrigger from '../../components/HiddenTrigger';

describe('HiddenTrigger', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders children normally', () => {
    render(
      <HiddenTrigger onActivated={jest.fn()}>
        <span>© 2026</span>
      </HiddenTrigger>
    );
    expect(screen.getByText('© 2026')).toBeInTheDocument();
  });

  test('fires onActivated after 5 clicks within 3 seconds', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const onActivated = jest.fn();

    render(
      <HiddenTrigger onActivated={onActivated}>
        <span>© 2026</span>
      </HiddenTrigger>
    );

    const el = screen.getByText('© 2026');

    await user.click(el);
    jest.advanceTimersByTime(500);
    await user.click(el);
    jest.advanceTimersByTime(500);
    await user.click(el);
    jest.advanceTimersByTime(500);
    await user.click(el);
    jest.advanceTimersByTime(500);
    await user.click(el);

    expect(onActivated).toHaveBeenCalledTimes(1);
  });

  test('does NOT fire after 4 clicks', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const onActivated = jest.fn();

    render(
      <HiddenTrigger onActivated={onActivated}>
        <span>© 2026</span>
      </HiddenTrigger>
    );

    const el = screen.getByText('© 2026');

    await user.click(el);
    jest.advanceTimersByTime(500);
    await user.click(el);
    jest.advanceTimersByTime(500);
    await user.click(el);
    jest.advanceTimersByTime(500);
    await user.click(el);

    expect(onActivated).not.toHaveBeenCalled();
  });

  test('resets count when clicks exceed 3-second interval', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const onActivated = jest.fn();

    render(
      <HiddenTrigger onActivated={onActivated}>
        <span>test</span>
      </HiddenTrigger>
    );

    const el = screen.getByText('test');

    await user.click(el);
    jest.advanceTimersByTime(500);
    await user.click(el);

    jest.advanceTimersByTime(3500);

    await user.click(el);
    jest.advanceTimersByTime(500);
    await user.click(el);
    jest.advanceTimersByTime(500);
    await user.click(el);
    jest.advanceTimersByTime(500);
    await user.click(el);
    jest.advanceTimersByTime(500);
    await user.click(el);

    expect(onActivated).toHaveBeenCalledTimes(1);
  });

  test('clicking 7 times within 3s fires only once', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const onActivated = jest.fn();

    render(
      <HiddenTrigger onActivated={onActivated}>
        <span>test</span>
      </HiddenTrigger>
    );

    const el = screen.getByText('test');

    for (let i = 0; i < 7; i++) {
      await user.click(el);
      jest.advanceTimersByTime(200);
    }

    expect(onActivated).toHaveBeenCalledTimes(1);
  });
});
