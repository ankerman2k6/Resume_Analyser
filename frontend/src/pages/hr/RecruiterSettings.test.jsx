import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import RecruiterSettings from './RecruiterSettings';

describe('RecruiterSettings', () => {
  it('renders profile and company fields and shows UI-only save feedback', () => {
    const { container } = render(
      <AuthProvider>
        <MemoryRouter>
          <RecruiterSettings />
        </MemoryRouter>
      </AuthProvider>
    );

    fireEvent.change(screen.getByPlaceholderText('Nhập họ và tên'), {
      target: { value: 'Nguyễn Minh Anh' },
    });
    fireEvent.change(screen.getByPlaceholderText('name@company.com'), {
      target: { value: 'minhanh@company.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Nhập tên doanh nghiệp'), {
      target: { value: 'Công ty CMCV' },
    });
    fireEvent.submit(container.querySelector('form'));

    expect(screen.getByRole('status')).toHaveTextContent(
      'Dữ liệu chưa được gửi đến máy chủ.'
    );
  });

  it('allows adding another company location', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <RecruiterSettings />
        </MemoryRouter>
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Thêm địa điểm' }));

    expect(screen.getAllByPlaceholderText('Nhập thành phố')).toHaveLength(2);
  });
});
