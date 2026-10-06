export const loginApi = async (email, password, role) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, role }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Đăng nhập thất bại');
  }

  return data; // Trả về { token, userId, email, role }
};

// Api đăng ký người dùng
export const registerApi = async (email, password, role) => {
  const respone = await fetch('api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({email, password, role}),
  });

  const data = await respone.json();

  if(!respone.ok){
    if(data.errors){
      const firstError = Object.values(data.errors)[0];
      throw new Error(firstError);
    }
    throw new Error(data.message || 'Đăng ký tài khoản thất bại')
  }
  return data;
}