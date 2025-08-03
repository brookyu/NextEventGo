import React, { useState } from 'react';
import Real135Editor from './Real135Editor';
import Simple135Editor from './Simple135Editor';
import { get135EditorConfig, get135EditorUrls } from '../../config/135editor.config';

const Test135Editor: React.FC = () => {
  const [content, setContent] = useState('<p>测试135编辑器集成...</p>');
  const [isLoading, setIsLoading] = useState(false);
  const [useSimpleEditor, setUseSimpleEditor] = useState(false);
  
  const config = get135EditorConfig();
  const urls = get135EditorUrls(config);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    console.log('Content changed:', newContent);
  };

  const testApiConnection = async () => {
    setIsLoading(true);
    try {
      console.log('Testing 135editor API connection...');
      console.log('Config:', config);
      console.log('URLs:', urls);
      
      // Test the style URL
      const response = await fetch(urls.style_url, {
        method: 'GET',
        mode: 'cors',
      });
      
      console.log('API Response status:', response.status);
      console.log('API Response headers:', response.headers);
      
      if (response.ok) {
        const data = await response.text();
        console.log('API Response data (first 500 chars):', data.substring(0, 500));
        alert('135editor API connection successful! Check console for details.');
      } else {
        console.error('API Response error:', response.statusText);
        alert(`API connection failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('API connection error:', error);
      alert(`API connection error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">135Editor Integration Test</h1>
        
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <h2 className="text-lg font-semibold mb-2">Configuration</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>AppKey:</strong> {config.appkey}
            </div>
            <div>
              <strong>Platform Host:</strong> {config.plat_host}
            </div>
            <div>
              <strong>Base URL:</strong> {config.base_url}
            </div>
            <div>
              <strong>Sign Token:</strong> {config.sign_token || 'Not set'}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h2 className="text-lg font-semibold mb-2">API URLs</h2>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Style URL:</strong> 
              <br />
              <code className="text-xs bg-white p-1 rounded">{urls.style_url}</code>
            </div>
            <div>
              <strong>Page URL:</strong> 
              <br />
              <code className="text-xs bg-white p-1 rounded">{urls.page_url}</code>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={testApiConnection}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test API Connection'}
          </button>
          
          <button
            onClick={() => setContent('<p>重置内容...</p>')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Reset Content
          </button>

          <button
            onClick={() => setUseSimpleEditor(!useSimpleEditor)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            {useSimpleEditor ? 'Use Complex Editor' : 'Use Simple Editor'}
          </button>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">
          135Editor Instance ({useSimpleEditor ? 'Simple' : 'Complex'})
        </h2>
        <div style={{ minHeight: '600px' }}>
          {useSimpleEditor ? (
            <Simple135Editor
              content={content}
              onChange={handleContentChange}
              style={{ width: '100%', minHeight: '600px' }}
              className="border rounded"
            />
          ) : (
            <Real135Editor
              content={content}
              onChange={handleContentChange}
              style={{ width: '100%', minHeight: '600px' }}
              className="border rounded"
            />
          )}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Current Content</h2>
        <div className="bg-gray-50 p-4 rounded border">
          <pre className="text-sm overflow-auto max-h-40">
            {content}
          </pre>
        </div>
      </div>

      <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Instructions</h2>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>Click "Test API Connection" to verify the 135editor API is accessible</li>
          <li>The editor should load with 135editor templates and styles</li>
          <li>Look for the "模板" (Templates) button in the editor toolbar</li>
          <li>Templates should be fetched from 135editor servers</li>
          <li>Check the browser console for detailed logs</li>
        </ul>
      </div>
    </div>
  );
};

export default Test135Editor;
