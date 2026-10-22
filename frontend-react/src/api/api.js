const API_URL = 'http://localhost:3000/api';

export async function login(usuario, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario, password }),
  });
  return res.json();
}

export async function registrarDoctor(doctorData) {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doctorData),
  });
  return res.json();
}
