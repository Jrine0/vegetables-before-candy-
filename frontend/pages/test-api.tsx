import React, { useState } from 'react';
import { authAPI } from '../src/lib/api';

const TestAPI: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/health');
      const data = await response.json();
      setResult(`Health check: ${JSON.stringify(data)}`);
    } catch (error) {
      setResult(`Health error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await authAPI.login({ email: 'demo@harvard.edu', password: 'demo123' });
      setResult(`Login success: ${JSON.stringify(response.data)}`);
    } catch (error: any) {
      setResult(`Login error: ${error.message} - ${error.response?.data?.error || 'No detailed error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testCORS = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      });
      const data = await response.json();
      setResult(`CORS test: ${JSON.stringify(data)}`);
    } catch (error) {
      setResult(`CORS error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>API Connection Test</h1>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={testHealth} disabled={loading} style={{ margin: '5px' }}>
          Test Health Endpoint
        </button>
        <button onClick={testCORS} disabled={loading} style={{ margin: '5px' }}>
          Test CORS
        </button>
        <button onClick={testLogin} disabled={loading} style={{ margin: '5px' }}>
          Test Login API
        </button>
      </div>
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '10px', 
        border: '1px solid #ddd',
        minHeight: '100px',
        whiteSpace: 'pre-wrap'
      }}>
        {loading ? 'Loading...' : result || 'Click a button to test API connection'}
      </div>
      <div style={{ marginTop: '20px' }}>
        <h3>Configuration:</h3>
        <p>API Base URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}</p>
        <p>Frontend URL: {typeof window !== 'undefined' ? window.location.origin : 'SSR'}</p>
      </div>
    </div>
  );
};

export default TestAPI;