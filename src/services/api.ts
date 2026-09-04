export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'passenger' | 'owner' | 'admin';
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

export interface AdminStats {
  totalUsers: number;
  totalPassengers: number;
  totalOwners: number;
  totalBuses: number;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Login failed. Please check your credentials.');
  }
  return data;
}

export async function registerApi(
  name: string,
  email: string,
  password: string,
  phone?: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, phone }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Registration failed.');
  }
  return data;
}

export async function getMeApi(token: string): Promise<{ success: boolean; user: User }> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch user session.');
  }
  return data;
}

export async function getAdminStatsApi(token: string): Promise<{ success: boolean; data: AdminStats }> {
  const res = await fetch(`${API_BASE}/admin/statistics`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch admin statistics.');
  }
  return data;
}

