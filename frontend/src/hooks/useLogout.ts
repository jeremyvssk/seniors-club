import { useNavigate } from 'react-router-dom';
import { clearSession } from '../lib/session';

export const useLogout = () => {
  const navigate = useNavigate();
  return () => {
    clearSession();
    navigate('/');
  };
};
