import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';

describe('Kiểm tra Navbar Component', () => {
  it('phải hiển thị đầy đủ nút Đăng nhập và nút Đăng ký', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // 1. Kiểm tra sự tồn tại của nút "Đăng nhập"
    const loginButton = screen.getByRole('button', { name: /đăng nhập/i });
    expect(loginButton).toBeInTheDocument();

    // 2. Kiểm tra sự tồn tại của nút "Đăng ký"
    const registerButton = screen.getByRole('button', { name: /đăng ký/i });
    expect(registerButton).toBeInTheDocument();

    // 3. Kiểm tra logo thương hiệu CMCV
    const brandLogo = screen.getByText('CMCV');
    expect(brandLogo).toBeInTheDocument();
  });
});
