import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { websocketService } from '../services/websocket.service';

export const useWebSocketConnection = () => {
  const location = useLocation();
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const user = sessionStorage.getItem('user');
    
    const publicRoutes = ['/', '/login', '/signup'];
    const isPublicRoute = publicRoutes.includes(location.pathname);
    
    if (token && user && !isPublicRoute) {
      console.log('Initializing WebSocket connection...');
      
      websocketService.connect(token)
        .then(() => {
          console.log('WebSocket connected successfully');
          setIsConnected(true);
        })
        .catch((err) => {
          console.error('WebSocket connection failed:', err);
          // Retry after 2 seconds
          setTimeout(() => {
            console.log('Retrying WebSocket connection...');
            websocketService.connect(token)
              .then(() => {
                console.log('WebSocket reconnected');
                setIsConnected(true);
              })
              .catch(console.error);
          }, 2000);
        });
      
      return () => {
        console.log('Cleaning up WebSocket...');
        websocketService.disconnect();
        setIsConnected(false);
      };
    }
  }, [location.pathname]);

  return isConnected;
};