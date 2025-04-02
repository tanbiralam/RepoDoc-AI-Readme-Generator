"use client";

import { useState, useEffect } from 'react';

export default function AuthLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [lastAuthUrl, setLastAuthUrl] = useState<string>('');

  useEffect(() => {
    // Load logs from localStorage
    const storedLogs = localStorage.getItem('authLogs');
    const storedUrl = localStorage.getItem('lastAuthUrl');
    
    if (storedLogs) {
      try {
        setLogs(JSON.parse(storedLogs));
      } catch (e) {
        console.error('Error parsing logs:', e);
      }
    }
    
    if (storedUrl) {
      setLastAuthUrl(storedUrl);
    }
  }, []);

  const clearLogs = () => {
    localStorage.removeItem('authLogs');
    localStorage.removeItem('lastAuthUrl');
    setLogs([]);
    setLastAuthUrl('');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Authentication Debug Logs</h1>
      
      <div className="mb-6 flex items-center justify-between">
        <button 
          onClick={clearLogs}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Clear Logs
        </button>
        
        <button 
          onClick={() => window.location.href = '/'}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Back to Home
        </button>
      </div>
      
      {lastAuthUrl && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 p-4 rounded">
          <h2 className="font-bold text-lg mb-2">Last GitHub Authorization URL</h2>
          <div className="bg-white p-3 rounded overflow-x-auto border border-gray-200">
            <code className="text-sm break-all text-black">{lastAuthUrl}</code>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            This is the exact URL that was generated for GitHub authentication.
            Check if the <code>redirect_uri</code> parameter matches what's configured in your GitHub OAuth app settings.
          </p>
        </div>
      )}
      
      <div className="bg-gray-50 p-4 rounded border border-gray-200">
        <h2 className="font-bold text-lg mb-4 text-black">Authentication Flow Logs</h2>
        
        {logs.length === 0 ? (
          <p className=" italic text-black">No authentication logs found.</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log, index) => (
              <div key={index} className="bg-white p-3 rounded border border-gray-200">
                <div className="font-medium text-black">{log.event}</div>
                <div className="text-xs text-gray-500 mb-2">{log.timestamp}</div>
                
                {log.redirectUrl && (
                  <div className="mt-1">
                    <span className="font-medium text-black">Redirect URL:</span> {log.redirectUrl}
                  </div>
                )}
                
                {log.hasUrl !== undefined && (
                  <div className="mt-1">
                    <span className="font-medium text-black">Has URL:</span> {log.hasUrl ? 'Yes' : 'No'}
                  </div>
                )}
                
                {log.error && (
                  <div className="mt-1 text-red-600">
                    <span className="font-medium text-black">Error:</span> {log.error}
                  </div>
                )}
                
                {log.scopes && (
                  <div className="mt-1">
                    <span className="font-medium text-black">Scopes:</span> {Array.isArray(log.scopes) ? log.scopes.join(', ') : log.scopes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
