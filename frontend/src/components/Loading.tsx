// src/components/Loading.tsx
import React from 'react';

const Loading = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="loader"></div> {/* Use the CSS loader */}
    </div>
  );
};

export default Loading;
