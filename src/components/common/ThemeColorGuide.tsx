import React from 'react';
import { useChainId } from 'wagmi';
import { getChainColorClass } from '../../utils/chain';
import { MONAD_TESTNET_ID, FUSE_EMBER_ID } from '../../constants/theme';

/**
 * Theme Color Guide component to demonstrate proper usage of blockchain dynamic colors
 * This is a reference component - not meant to be displayed in the UI
 */
const ThemeColorGuide: React.FC = () => {
  const chainId = useChainId();
  
  return (
    <div className="p-6 space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-4">Dynamic Theme Colors - DO</h2>
        <div className="grid grid-cols-2 gap-4">
          {/* Example of proper theme color usage */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Buttons</h3>
            
            {/* Primary button with dynamic theme color */}
            <button className="px-4 py-2 bg-theme-primary text-black rounded-lg">
              Primary Action
            </button>
            
            {/* Secondary button with opacity */}
            <button className="px-4 py-2 bg-theme-primary/20 text-theme-primary rounded-lg ml-2">
              Secondary Action
            </button>
            
            {/* Code example */}
            <pre className="mt-2 bg-gray-800 p-2 rounded text-xs">
              {'<button className="bg-theme-primary">Primary</button>'}<br/>
              {'<button className="bg-theme-primary/20">Secondary</button>'}
            </pre>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Text & Icons</h3>
            
            {/* Text with theme color */}
            <p className="text-theme-primary font-semibold">Highlighted text</p>
            
            {/* Icon with theme color */}
            <div className="text-theme-primary mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
              </svg>
            </div>
            
            {/* Code example */}
            <pre className="mt-2 bg-gray-800 p-2 rounded text-xs">
              {'<p className="text-theme-primary">Highlighted text</p>'}<br/>
              {'<Icon className="text-theme-primary" />'}
            </pre>
          </div>
        </div>
      </section>
      
      <section>
        <h2 className="text-xl font-bold mb-4">Using Chain-Specific Classes - DO</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Dynamic Classes with Chain ID</h3>
            
            {/* Using getChainColorClass utility */}
            <button className={`px-4 py-2 ${getChainColorClass(chainId)} text-black rounded-lg`}>
              Chain-specific button
            </button>
            
            {/* Code example */}
            <pre className="mt-2 bg-gray-800 p-2 rounded text-xs">
              {"import { getChainColorClass } from '../utils/chain';"}<br/>
              {"const chainId = useChainId();"}<br/>
              {'<button className={`${getChainColorClass(chainId)}`}>'}<br/>
              {'  Chain-specific button'}<br/>
              {'</button>'}
            </pre>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Conditional Classes</h3>
            
            {/* Conditional chain-specific classes */}
            <div className={`p-4 rounded-lg ${
              chainId === MONAD_TESTNET_ID ? 'bg-monad-green/20 text-monad-green' :
              chainId === FUSE_EMBER_ID ? 'bg-fuse-gold/20 text-fuse-gold' :
              'bg-gray-500/20 text-gray-500'
            }`}>
              Chain-specific container
            </div>
            
            {/* Code example */}
            <pre className="mt-2 bg-gray-800 p-2 rounded text-xs">
              {'<div className={`p-4 rounded-lg ${'}<br/>
              {'  chainId === MONAD_TESTNET_ID ? \'bg-monad-green/20\' :'}<br/>
              {'  chainId === FUSE_EMBER_ID ? \'bg-fuse-gold/20\' :'}<br/>
              {'  \'bg-gray-500/20\''}<br/>
              {'}`}>Chain-specific content</div>'}
            </pre>
          </div>
        </div>
      </section>
      
      <section className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-4 text-red-400">Hardcoded Colors - DON'T</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-red-400">Avoid Hardcoded HEX Values</h3>
            
            {/* Hardcoded colors - BAD PRACTICE */}
            <button className="px-4 py-2 bg-[#4ADE80] text-black rounded-lg line-through">
              Bad: Hardcoded Color
            </button>
            
            {/* Code example */}
            <pre className="mt-2 bg-gray-800 p-2 rounded text-xs text-red-400">
              {`❌ <button className="bg-[#4ADE80]">Bad</button>`}
            </pre>
            
            {/* Correction */}
            <pre className="mt-2 bg-gray-800 p-2 rounded text-xs text-green-400">
              {`✅ <button className="bg-theme-primary">Good</button>`}<br/>
              {`✅ <button className="bg-monad-green">Also Good</button>`}
            </pre>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2 text-red-400">Avoid Static Chain-Specific Styles</h3>
            
            {/* Hardcoded chain-specific styles - BAD PRACTICE */}
            <div className="p-4 rounded-lg bg-monad-green text-black line-through">
              Bad: Hardcoded to one chain
            </div>
            
            {/* Code example */}
            <pre className="mt-2 bg-gray-800 p-2 rounded text-xs text-red-400">
              {`❌ <div className="bg-monad-green">`}<br/>
              {`  Always shows Monad style even on Fuse chain`}<br/>
              {`</div>`}
            </pre>
            
            {/* Correction */}
            <pre className="mt-2 bg-gray-800 p-2 rounded text-xs text-green-400">
              {`✅ <div className="bg-theme-primary">`}<br/>
              {`  Changes based on current chain`}<br/>
              {`</div>`}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ThemeColorGuide; 