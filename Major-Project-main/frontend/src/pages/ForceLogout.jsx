import { useEffect } from 'react';

const ForceLogout = () => {
  useEffect(() => {
    // Clear all authentication data
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userToken');
    
    // Force redirect to login
    window.location.href = '/login';
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column'
    }}>
      <h1>Logging Out...</h1>
      <p>Please wait, you are being redirected.</p>
    </div>
  );
};

export default ForceLogout; 