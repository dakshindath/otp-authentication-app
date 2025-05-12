import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/login.css';

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = React.useState(location.state?.email || '');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });
      
      setLoading(false);
      
      // Store token in localStorage
      localStorage.setItem('authToken', response.data.token);
      
      navigate('/home');
    } catch (error: any) {
      setLoading(false);
      setError(error.response?.data?.message || 'Invalid credentials. Please try again.');
      console.error('Login error:', error);
    }
  };
  
  return (
    <div className='login-container'>
      <div className='login-card'>
        <h1 className='login-title'>Sign in</h1>
        
        {error && (
          <div className='error-message'>{error}</div>
        )}
        
        <form onSubmit={handleSubmit} className='login-form'>
          <div className='form-group'>
            <label htmlFor='email'>Email</label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='you@example.com'
              autoComplete='email'
              required
            />
          </div>
          
          <div className='form-group'>
            <label htmlFor='password'>Password</label>
            <input
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=''
              autoComplete='current-password'
              required
            />
          </div>
          
          <div className='forgot-password'>
            <a href='/forgot-password' className='text-link'>Forgot password?</a>
          </div>
          
          <button
            type='submit'
            className='btn btn-primary'
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        
        <div className='login-footer'>
          <p>
            Don't have an account?{' '}
            <a href='/signup' className='text-link'>Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
}
