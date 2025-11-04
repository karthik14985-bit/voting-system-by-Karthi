import React, { useState, useMemo } from 'react';
import { View, UserRegistrationData } from '../../types';
import { useVotingData } from '../../hooks/useVotingData';
import Button from '../common/Button';
import Input from '../common/Input';

interface VoterRegistrationProps {
  onNavigate: (view: View) => void;
}

const VoterRegistration: React.FC<VoterRegistrationProps> = ({ onNavigate }) => {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { addUser } = useVotingData();

  const captchaNumbers = useMemo(() => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    return { num1, num2, answer: num1 + num2 };
  }, [success]);

  const validatePassword = (pass: string) => {
    return pass.length >= 8 && /[A-Z]/.test(pass) && /[a-z]/.test(pass) && /[0-9]/.test(pass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (parseInt(age) < 18) {
        setError("You must be at least 18 years old to register.");
        return;
    }
    if (!validatePassword(password)) {
        setError("Password must be at least 8 characters long and contain uppercase, lowercase, and numbers.");
        return;
    }
    if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
    }
    if (aadhaar.length !== 12 || !/^\d+$/.test(aadhaar)) {
        setError("Aadhaar number must be 12 digits.");
        return;
    }
    if(parseInt(captcha) !== captchaNumbers.answer) {
        setError("Incorrect CAPTCHA answer.");
        return;
    }

    setIsLoading(true);
    const userData: UserRegistrationData = {
        fullName,
        age: parseInt(age),
        email,
        passwordHash: password, // NOTE: Storing plain text for demo. Use hashing in production.
        aadhaarNumber: aadhaar // NOTE: Storing plain text for demo. Encrypt in production.
    };

    try {
        const result = await addUser(userData);
        if (result.success) {
            setSuccess(result.message + ' You will be redirected to login shortly.');
            setTimeout(() => onNavigate(View.VOTER_LOGIN), 3000);
        } else {
            setError(result.message);
        }
    } catch (err) {
        setError("An unexpected error occurred during registration.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Voter Registration</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset disabled={isLoading}>
            <div className="space-y-4">
              <Input id="fullName" label="Full Name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              <Input id="age" label="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} required min="0" />
              <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <p className="text-xs text-gray-500 dark:text-gray-400">Min 8 characters, with uppercase, lowercase, and a number.</p>
              <Input id="confirmPassword" label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              <Input id="aadhaar" label="Aadhaar Number (12 digits)" type="text" value={aadhaar} onChange={(e) => setAadhaar(e.target.value)} required maxLength={12} />
              
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center space-x-4">
                <span className="text-lg font-mono">{captchaNumbers.num1} + {captchaNumbers.num2} = ?</span>
                <Input id="captcha" label="" type="number" value={captcha} onChange={(e) => setCaptcha(e.target.value)} required className="w-24" />
              </div>
            </div>
          </fieldset>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && <p className="text-green-500 text-sm text-center">{success}</p>}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
            </Button>
        </form>
      </div>
    </div>
  );
};

export default VoterRegistration;
