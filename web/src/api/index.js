const API_BASE = '/api';

export async function fetchAllAccounts() {
  const response = await fetch(`${API_BASE}/accounts`);
  if (!response.ok) {
    throw new Error('Failed to fetch accounts');
  }
  return response.json();
}

export async function fetchAccount(name) {
  const response = await fetch(`${API_BASE}/accounts/${encodeURIComponent(name)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch account');
  }
  return response.json();
}
