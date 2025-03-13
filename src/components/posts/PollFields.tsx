import React from 'react';

const PollFields: React.FC = () => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Poll Question</label>
      <input
        type="text"
        placeholder="Enter poll question"
        className="mt-1 block w-full text-sm text-gray-500 border border-gray-300 rounded-md"
      />
      
      <label className="block text-sm font-medium text-gray-700 mt-4">Poll Options</label>
      <input
        type="text"
        placeholder="Option 1"
        className="mt-1 block w-full text-sm text-gray-500 border border-gray-300 rounded-md"
      />
      <input
        type="text"
        placeholder="Option 2"
        className="mt-1 block w-full text-sm text-gray-500 border border-gray-300 rounded-md"
      />
      {/* Add more options as needed */}
    </div>
  );
};

export default PollFields; 