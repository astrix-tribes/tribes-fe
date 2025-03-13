import React from 'react';
import { Loader } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center">
      <div className="animate-spin mb-4">
        <Loader size={48} className="text-monad-purple" />
      </div>
      <h2 className="text-xl font-medium text-white">Loading...</h2>
    </div>
  );
};

export default LoadingScreen; 