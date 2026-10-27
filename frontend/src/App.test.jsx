import { beforeEach, describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import App from './App';

vi.mock('@react-three/fiber', async (importOriginal) => ({
  ...await importOriginal(),
  Canvas: () => <div data-testid="landing-canvas" />,
}));

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.pushState({}, '', '/');
  });

  it('renders application without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeDefined();
  });

  it('redirects unauthenticated users from the CV page to login', async () => {
    window.history.pushState({}, '', '/cv');

    render(<App />);

    expect(
      await screen.findByRole('heading', { name: 'Chào mừng trở lại' })
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
  });

  it('sends guests to login when they click the create CV button', async () => {
    window.history.pushState({}, '', '/candidate');
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Tạo CV' }));

    expect(
      await screen.findByRole('heading', { name: 'Chào mừng trở lại' })
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
  });

  it('allows authenticated users to open the CV page', async () => {
    localStorage.setItem('token', 'test-token');
    window.history.pushState({}, '', '/cv');

    render(<App />);

    expect(
      await screen.findByRole('heading', { name: 'Tải lên & Quản lý CV' })
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe('/cv');
  });
});
