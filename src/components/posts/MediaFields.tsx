import React from 'react';

const MediaFields: React.FC = () => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Upload Media</label>
      <input
        type="file"
        accept="video/*, audio/*"
        className="mt-1 block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-gray-200 file:text-gray-700
          hover:file:bg-gray-300"
      />
    </div>
  );
};

export default MediaFields; 