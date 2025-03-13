import React from 'react';

const ResourceFields: React.FC = () => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Resource Type</label>
      <select className="mt-1 block w-full text-sm text-gray-500 border border-gray-300 rounded-md">
        <option value="document">Document</option>
        <option value="link">Link</option>
        <option value="code">Code</option>
        <option value="other">Other</option>
      </select>
      
      <label className="block text-sm font-medium text-gray-700 mt-4">Resource URL</label>
      <input
        type="text"
        placeholder="Enter resource URL"
        className="mt-1 block w-full text-sm text-gray-500 border border-gray-300 rounded-md"
      />
    </div>
  );
};

export default ResourceFields; 