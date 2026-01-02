import { apiEndpoint } from '../constants/urls';

export const fetchData = async (type) => {
  if (!type) {
    throw new Error('A data type is required (e.g., announcements, sermons).');
  }

  const url = apiEndpoint(type);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${type}: ${response.status}`);
    }

    const data = await response.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  } catch (error) {
    console.warn('API error:', error.message);
    throw error;
  }
};

export const submitPrayerRequest = async ({ name, email, phone, request, dateTime }) => {
  const response = await fetch(apiEndpoint('prayer'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'submitPrayer',
      name,
      email,
      phone,
      request,
      dateTime,
    }),
  });

  if (!response.ok) {
    throw new Error(`Prayer request failed: ${response.status}`);
  }

  return response.json();
};

export const registerPushToken = async (token, platform) => {
  if (!token) return;
  const response = await fetch(apiEndpoint('push'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'registerPushToken',
      token,
      platform,
    }),
  });

  if (!response.ok) {
    throw new Error(`Push token registration failed: ${response.status}`);
  }

  return response.json();
};
