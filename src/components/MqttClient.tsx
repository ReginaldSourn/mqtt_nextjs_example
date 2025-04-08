import React, { useState, useEffect, useCallback } from 'react';
import useMqtt from '../hooks/useMqtt';
import ConnectionIndicator from './ConnectionIndicator';

interface MqttMessage {
  topic: string;
  payload: string;
  timestamp: Date;
}

interface MqttClientProps {
  initialBrokerUrl: string;
  initialClientId: string;
}

const MqttClient: React.FC<MqttClientProps> = ({ 
  initialBrokerUrl,
  initialClientId
}) => {
  const [brokerUrl, setBrokerUrl] = useState<string>(initialBrokerUrl);
  const [clientId, setClientId] = useState<string>(initialClientId);
  const [topic, setTopic] = useState<string>('test/topic');
  const [subscriptions, setSubscriptions] = useState<string[]>([]);
  const [publishTopic, setPublishTopic] = useState<string>('test/topic');
  const [publishMessage, setPublishMessage] = useState<string>('');
  const [messages, setMessages] = useState<MqttMessage[]>([]);
  const [connectionAttempts, setConnectionAttempts] = useState<number>(0);
  
  // MQTT connection options
  const mqttOptions = {
    clientId,
    clean: true,
    reconnectPeriod: 5000, // Try to reconnect every 5 seconds
    connectTimeout: 10000, // 10 seconds timeout for connection
  };
  
  const { 
    connectionStatus, 
    message, 
    error, 
    connect,
    disconnect,
    subscribe, 
    publish 
  } = useMqtt(brokerUrl, mqttOptions);

  const isConnected = connectionStatus.connected;
  const isConnecting = connectionStatus.connecting;
  const isReconnecting = connectionStatus.reconnecting;

  // Handle new messages
  useEffect(() => {
    if (message) {
      setMessages(prev => [...prev, message].slice(-20)); // Keep last 20 messages
    }
  }, [message]);

  // Handle broker URL change
  const handleBrokerUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBrokerUrl(e.target.value);
  };

  // Handle client ID change
  const handleClientIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientId(e.target.value);
  };

  // Handle connect button click
  const handleConnect = useCallback(() => {
    if (isConnected) {
      disconnect();
      // Clear subscriptions when disconnecting
      setSubscriptions([]);
    } else {
      connect();
      setConnectionAttempts(prev => prev + 1);
    }
  }, [isConnected, connect, disconnect]);

  // Handle new subscription
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic && !subscriptions.includes(topic)) {
      subscribe(topic);
      setSubscriptions(prev => [...prev, topic]);
      setTopic('');
    }
  };

  // Handle publishing
  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (publishTopic && publishMessage) {
      publish(publishTopic, publishMessage);
      setPublishMessage('');
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="broker-url" className="block text-sm font-medium text-gray-700">
              Broker URL
            </label>
            <div className="flex">
              <input
                id="broker-url"
                type="text"
                value={brokerUrl}
                onChange={handleBrokerUrlChange}
                disabled={isConnected || isConnecting}
                className="flex-grow border border-gray-300 p-2 rounded-l text-sm text-gray-900 placeholder-gray-500 disabled:bg-gray-100"
                placeholder="wss://broker-address:port"
              />
              <button
                onClick={handleConnect}
                disabled={isConnecting || isReconnecting}
                className={`px-4 py-2 rounded-r text-white ${
                  isConnected 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-green-500 hover:bg-green-600'
                } disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200`}
              >
                {isConnected ? 'Disconnect' : 
                 isConnecting ? 'Connecting...' : 
                 isReconnecting ? 'Reconnecting...' : 'Connect'}
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="client-id" className="block text-sm font-medium text-gray-700">
              Client ID
            </label>
            <input
              id="client-id"
              type="text"
              value={clientId}
              onChange={handleClientIdChange}
              disabled={isConnected || isConnecting}
              className="w-full border border-gray-300 p-2 rounded text-sm text-gray-900 placeholder-gray-500 disabled:bg-gray-100"
              placeholder="Client identifier"
            />
          </div>
        </div>
        
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 bg-gray-100 rounded border">
          <div className="flex items-center gap-2">
            <ConnectionIndicator 
              isConnected={isConnected}
              isConnecting={isConnecting}
              isReconnecting={isReconnecting}
            />
            
            {isConnected && (
              <span className="text-xs text-gray-700 ml-2">
                Connected to {brokerUrl}
              </span>
            )}
            
            {isConnecting && (
              <span className="text-xs text-gray-700 ml-2">
                Connecting to {brokerUrl}...
              </span>
            )}
            
            {isReconnecting && (
              <span className="text-xs text-gray-700 ml-2">
                Reconnecting to {brokerUrl}...
              </span>
            )}
          </div>
          
          {error && (
            <div className="px-3 py-1 bg-red-100 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-gray-300 p-4 rounded bg-white">
          <h3 className="font-bold mb-2 text-gray-800">Subscribe to Topic</h3>
          <form onSubmit={handleSubscribe} className="flex flex-col space-y-2">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter topic to subscribe"
              disabled={!isConnected}
              className="border border-gray-300 p-2 rounded text-gray-900 disabled:bg-gray-100"
            />
            <button 
              type="submit" 
              disabled={!isConnected || !topic}
              className="bg-blue-500 text-white p-2 rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Subscribe
            </button>
          </form>
          
          <div className="mt-4">
            <h4 className="font-bold text-gray-800">Current Subscriptions:</h4>
            {isConnected ? (
              subscriptions.length > 0 ? (
                <ul className="list-disc list-inside text-gray-700">
                  {subscriptions.map((sub, index) => (
                    <li key={index}>{sub}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No active subscriptions</p>
              )
            ) : (
              <p className="text-gray-600">Connect to broker first</p>
            )}
          </div>
        </div>

        <div className="border border-gray-300 p-4 rounded bg-white">
          <h3 className="font-bold mb-2 text-gray-800">Publish Message</h3>
          <form onSubmit={handlePublish} className="flex flex-col space-y-2">
            <input
              type="text"
              value={publishTopic}
              onChange={(e) => setPublishTopic(e.target.value)}
              placeholder="Topic"
              disabled={!isConnected}
              className="border border-gray-300 p-2 rounded text-gray-900 disabled:bg-gray-100"
            />
            <textarea
              value={publishMessage}
              onChange={(e) => setPublishMessage(e.target.value)}
              placeholder="Message"
              disabled={!isConnected}
              className="border border-gray-300 p-2 rounded text-gray-900 disabled:bg-gray-100"
              rows={3}
            />
            <button 
              type="submit" 
              disabled={!isConnected || !publishTopic || !publishMessage}
              className="bg-green-500 text-white p-2 rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Publish
            </button>
          </form>
        </div>
      </div>

      <div className="mt-4 border border-gray-300 p-4 rounded bg-white">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-gray-800">Messages</h3>
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-gray-700"
            >
              Clear
            </button>
          )}
        </div>
        
        {isConnected ? (
          messages.length > 0 ? (
            <div className="max-h-60 overflow-y-auto border border-gray-300 rounded">
              {messages.map((msg, index) => (
                <div key={index} className="border-b border-gray-300 p-2 hover:bg-gray-50">
                  <div className="flex justify-between">
                    <p className="font-semibold text-sm text-gray-800">Topic: {msg.topic}</p>
                    <p className="text-xs text-gray-600">
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="mt-1 bg-gray-50 p-2 rounded text-sm break-words">
                    <span className="text-xs text-gray-600">Payload:</span>
                    <pre className="whitespace-pre-wrap mt-1 text-gray-900">{msg.payload}</pre>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center bg-gray-50 rounded border border-gray-200">
              <p className="text-gray-600">No messages received</p>
              <p className="text-xs text-gray-500 mt-1">
                Subscribe to a topic and wait for messages
              </p>
            </div>
          )
        ) : (
          <div className="p-4 text-center bg-gray-50 rounded border border-gray-200">
            <p className="text-gray-600">Not connected to broker</p>
            <p className="text-xs text-gray-500 mt-1">
              Connect to the broker to receive messages
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MqttClient;