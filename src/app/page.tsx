'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Skeleton } from '@/components/Skeleton';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  // Check if already logged in
  useEffect(() => {
    // Check login status from localStorage
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      router.push('/pm');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple login validation
    if (formData.username && formData.password) {
      // In a real application, this should call a backend API
      console.log('Login successful');
      
      // Set login status
      localStorage.setItem('isLoggedIn', 'true');
      
      // Navigate to PM page
      router.push('/pm');
    } else {
      alert('Please enter username and password');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Show loading screen while checking login status
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-teal-500 to-blue-600">
        <div className="w-32 h-32 mb-4">
          <Skeleton variant="circular" width="100%" height="100%" animation="wave" className="mb-4" />
        </div>
        <div className="w-48">
          <Skeleton width="100%" height="1.5rem" animation="wave" className="mb-2" />
          <Skeleton width="70%" height="1rem" animation="wave" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-teal-500 to-blue-600 relative overflow-hidden">
      {/* Wave animation background */}
      <div className="wave"></div>
      <div className="wave wave-2"></div>
      <div className="wave wave-3"></div>
      
      {/* Login card */}
      <div className="w-full max-w-md px-4 relative z-10">
        <div className="bg-white rounded-xl shadow-2xl p-8 backdrop-blur-sm bg-opacity-95">
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <Image
                src="/animated-turbine.svg"
                alt="Wind Turbine"
                width={96}
                height={96}
                className="text-teal-600"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Offshore Wind Farm 
            </h2>
            <h2 className="text-2xl font-bold text-gray-800">EAM System</h2>
            <p className="text-gray-500 mt-2">Please login to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-800"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-800"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-gray-700">
                  Remember me
                </label>
              </div>
              <div className="text-teal-600 hover:text-teal-700 cursor-pointer">
                Forgot password?
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200"
            >
              Log in
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            © 2025 Offshore Wind Farm System. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
