'use client';

import { useState } from 'react';
import MqttClient from '../components/MqttClient';

export default function MqttPage() {
  // Track broker configuration in parent component
  const [brokerConfig] = useState({
    url: process.env.NEXT_PUBLIC_MQTT_BROKER_URL || 'wss://test.mosquitto.org:8081',
    clientId: `${process.env.NEXT_PUBLIC_MQTT_CLIENT_ID || 'nextjs_mqtt_client_'}${Math.random().toString(16).substring(2, 8)}`,
  });

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-center mb-8">MQTT Client</h1>
      
      <div className="mb-8 bg-white shadow-md rounded-lg overflow-hidden">
        <div className="border-b bg-gray-50 p-4">
          <h2 className="text-lg font-medium">MQTT Connection</h2>
          <p className="text-sm text-gray-500 mt-1">
            Connect to an MQTT broker using WebSockets (wss://)
          </p>
        </div>
        
        <div className="p-4">
          <MqttClient 
            initialBrokerUrl={brokerConfig.url}
            initialClientId={brokerConfig.clientId}
          />
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-500">
        <p>Note: Connection timeout is set to 10 seconds. If the broker is unreachable, the connection will time out automatically.</p>
      </div>
    </main>
  );
}