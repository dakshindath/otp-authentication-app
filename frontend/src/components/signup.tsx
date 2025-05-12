import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/signup.css';

export default function SignUp() {
  const navigate = useNavigate();
  const [errors, setErrors] = React.useState({
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = React.useState(false);
  const [apiError, setApiError] = React.useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiError('');
    const formData = new FormData(event.currentTarget);
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    const newErrors = {
      username: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    };

    if (!username || username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long.';
    }

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number.';
    }

    if (!password || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);

    if (!Object.values(newErrors).some(Boolean)) {
      try {
        setLoading(true);

        // Make API call directly from component
        await axios.post('http://localhost:5000/api/auth/signup', {
          username,
          email,
          phone: phoneNumber,
          password,
        });

        setLoading(false);
        // Navigate to OTP verification page with email in state
        navigate('/verify-otp', { state: { email } });
      } catch (error: any) {
        setLoading(false);
        setApiError(error.response?.data?.message || 'An error occurred during signup');
        console.error('Signup error:', error);
      }
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1 className="signup-title">Sign up</h1>

        {apiError && (
          <div className="error-message">{apiError}</div>
        )}

        <form onSubmit={handleSubmit} noValidate className="signup-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              className={errors.username ? 'input-error' : ''}
              id="username"
              name="username"
              placeholder="username"
              autoComplete="username"
              required
            />
            {errors.username && <div className="error-text">{errors.username}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              className={errors.email ? 'input-error' : ''}
              id="email"
              name="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            {errors.email && <div className="error-text">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              className={errors.phoneNumber ? 'input-error' : ''}
              id="phoneNumber"
              name="phoneNumber"
              placeholder="1234567890"
              autoComplete="tel"
              required
            />
            {errors.phoneNumber && <div className="error-text">{errors.phoneNumber}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              className={errors.password ? 'input-error' : ''}
              id="password"
              name="password"
              type="password"
              placeholder="••••••"
              autoComplete="new-password"
              required
            />
            {errors.password && <div className="error-text">{errors.password}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              className={errors.confirmPassword ? 'input-error' : ''}
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••"
              autoComplete="new-password"
              required
            />
            {errors.confirmPassword && <div className="error-text">{errors.confirmPassword}</div>}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Signing up...' : 'Sign up'}
          </button>
        </form>

        <div className="signup-footer">
          <p>
            Already have an account?{' '}
            <a href="/signin" className="text-link">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}
