// src/components/ARView.tsx
import React, { useEffect } from 'react';

// Extend the Navigator interface to include the xr property
declare global {
  interface Navigator {
    xr?: any;
  }
}

const ARView: React.FC = () => {
  useEffect(() => {
    const startARSession = async () => {
      if (navigator.xr) {
        await navigator.xr.requestSession('immersive-ar');
        // Handle session events, like rendering and session end
      }
    };

    const checkARSupport = async () => {
      const supported = await navigator.xr.isSessionSupported('immersive-ar');
      if (supported) {
        startARSession();
      } else {
        console.warn('AR not supported');
      }
    };

    checkARSupport();
  }, []);

  return <div id="ar-view"> {/* Your AR content here */} </div>;
};

export default ARView;
