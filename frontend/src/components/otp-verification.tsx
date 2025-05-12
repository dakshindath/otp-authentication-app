import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/otp-verification.css';

export default function OtpVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = React.useState(['', '', '', '', '', '']);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [countdown, setCountdown] = React.useState(30);
  const [isResendDisabled, setIsResendDisabled] = React.useState(true);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  React.useEffect(() => {
    // Initialize the input refs array
    inputRefs.current = inputRefs.current.slice(0, 6);
    
    // Focus on the first input when component mounts
    if (inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
    
    // Start countdown for resend button
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    
    // Only allow numeric input
    if (value && !/^\d+$/.test(value)) {
      return;
    }
    
    // Update OTP state
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take the last character if multiple are pasted
    setOtp(newOtp);
    
    // Auto-focus next input if current one is filled
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Handle backspace to move to previous input
    if (e.key === 'Backspace' && index > 0 && !otp[index] && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    // Check if pasted content is numeric and has right length
    if (/^\d+$/.test(pastedData)) {
      const pastedOtp = pastedData.slice(0, 6).split('');
      const newOtp = [...otp];
      
      pastedOtp.forEach((digit, index) => {
        if (index < 6) {
          newOtp[index] = digit;
        }
      });
      
      setOtp(newOtp);
      
      // Focus the next empty input or the last one if all filled
      const nextEmptyIndex = newOtp.findIndex(digit => !digit);
      if (nextEmptyIndex !== -1 && inputRefs.current[nextEmptyIndex]) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else if (inputRefs.current[5]) {
        inputRefs.current[5]?.focus();
      }
    }
  };

  const handleResendOtp = async () => {
    // Reset countdown and disable resend button
    setCountdown(60);
    setIsResendDisabled(true);
    
    // Start countdown again
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    const email = location.state?.email || '';
    
    if (!email) {
      setError('Email information is missing. Please go back to signup.');
      return;
    }
    
    try {
      // Resend OTP by calling signup endpoint again
      await axios.post('http://localhost:5000/api/auth/signup', {
        email,
        // We need to send these fields but they'll be ignored for existing users
        username: 'resend',
        phone: 'resend',
        password: 'resend'
      });
      
      setError('');
    } catch (error: any) {
      setError('Failed to resend OTP. Please try again.');
      console.error('Resend OTP error:', error);
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    // Get email from location state or use an empty string as fallback
    const email = location.state?.email || '';
    
    if (!email) {
      setError('Email information is missing. Please go back to signup.');
      return;
    }
    
    try {
      setLoading(true);
      
      // Make API call directly from component
      await axios.post('http://localhost:5000/api/auth/verify-otp', {
        email,
        otp: otpString
      });
      
      setLoading(false);
      setError('');
      navigate('/signin', { state: { email } });
    } catch (error: any) {
      setLoading(false);
      setError(error.response?.data?.message || 'Invalid OTP. Please try again.');
      console.error('OTP verification error:', error);
    }
  };

  // Create refs for each input field
  const setInputRef = (el: HTMLInputElement | null, index: number) => {
    inputRefs.current[index] = el;
  };

  return (
    <div className="otp-container">
      <div className="otp-card">
        <h1 className="otp-title">Verify your identity</h1>
        
        <p className="otp-subtitle">
          We've sent a 6-digit verification code to
          {location.state?.email ? ` ${location.state.email}` : ' your email'}
        </p>
        
        <div className="otp-form-group">
          <label htmlFor="otp-input" className="otp-label">Enter verification code</label>
          <div className="otp-inputs-container">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={index === 0 ? handlePaste : undefined}
                ref={(el) => setInputRef(el, index)}
                inputMode="numeric"
                autoComplete="one-time-code"
                className="otp-input"
              />
            ))}
          </div>
          {error && (
            <div className="error-message">{error}</div>
          )}
        </div>
          <button
          className="btn btn-primary"
          onClick={handleVerifyOtp}
          disabled={loading}
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
        
        <div className="resend-container">
          <p className="resend-text">
            Didn't receive the code?{' '}
            <button
              className="resend-button"
              disabled={isResendDisabled}
              onClick={handleResendOtp}
            >
              {isResendDisabled ? `Resend in ${countdown}s` : 'Resend'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
