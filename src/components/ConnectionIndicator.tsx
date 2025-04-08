import React from 'react';

interface ConnectionIndicatorProps {
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
}

const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({ 
  isConnected, 
  isConnecting,
  isReconnecting
}) => {
  // Calculate status and styles
  let statusText = 'Disconnected';
  let ringColor = 'bg-red-500';
  let pulseEffect = '';
  
  if (isConnected) {
    statusText = 'Connected';
    ringColor = 'bg-green-500';
  } else if (isConnecting || isReconnecting) {
    statusText = isConnecting ? 'Connecting...' : 'Reconnecting...';
    ringColor = 'bg-yellow-500';
    pulseEffect = 'animate-pulse';
  }

  return (
    <div className="flex items-center space-x-2">
      <div className={`relative h-4 w-4 ${pulseEffect}`}>
        <div className={`absolute inset-0 rounded-full ${ringColor}`}></div>
        {(isConnecting || isReconnecting) && (
          <div className={`absolute inset-0 rounded-full ${ringColor} opacity-75 animate-ping`}></div>
        )}
      </div>
      <span className="text-sm font-medium">{statusText}</span>
    </div>
  );
};

export default ConnectionIndicator;