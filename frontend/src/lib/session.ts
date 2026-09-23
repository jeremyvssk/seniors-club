// The logged-in session lives in sessionStorage, so each browser tab can be a different user

// What /login returns as "user"
export interface SessionUser {
  id: number;
  email: string;
  name?: string;
  profileComplete?: boolean;
}

export const getToken = () => sessionStorage.getItem('token');

export const getSessionUser = (): SessionUser | null => {
  const userStr = sessionStorage.getItem('user');
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

export const saveSession = (token: string, user: SessionUser) => {
  sessionStorage.setItem('token', token);
  sessionStorage.setItem('user', JSON.stringify(user));
};

export const clearSession = () => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
};
