import { useState, useEffect, useCallback, useRef } from 'react';
import mqtt, { MqttClient, IClientOptions, ISubscriptionGrant } from 'mqtt';

interface MqttMessage {
  topic: string;
  payload: string;
  timestamp: Date;
}

interface ConnectionStatus {
  connected: boolean;
  connecting: boolean;
  reconnecting: boolean;
}

interface UseMqttReturn {
  client: MqttClient | null;
  connectionStatus: ConnectionStatus;
  message: MqttMessage | null;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  subscribe: (topic: string) => void;
  publish: (topic: string, message: string) => void;
}

export default function useMqtt(brokerUrl: string, options: IClientOptions = {}): UseMqttReturn {
  const [client, setClient] = useState<MqttClient | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    connecting: false,
    reconnecting: false
  });
  const [message, setMessage] = useState<MqttMessage | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Use refs for timeouts to avoid memory leaks
  const connectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Function to connect to the MQTT broker
  const connect = useCallback(() => {
    if (!brokerUrl || connectionStatus.connecting) return;
    
    setConnectionStatus(prev => ({ ...prev, connecting: true }));
    setError(null);
    
    // Create connection timeout (10 seconds)
    if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current);
    connectTimeoutRef.current = setTimeout(() => {
      if (!connectionStatus.connected) {
        setError('Connection timeout: Could not connect to the broker');
        setConnectionStatus(prev => ({ ...prev, connecting: false }));
        
        // If there's a client trying to connect, end it
        if (client) {
          client.end(true);
        }
      }
    }, 10000);
    
    // Create MQTT client with the provided options
    const mqttClient = mqtt.connect(brokerUrl, {
      ...options,
      connectTimeout: 10000, // 10 seconds timeout
    });
    
    // Set up event handlers
    mqttClient.on('connect', () => {
      console.log('Connected to MQTT broker');
      
      // Clear the timeout since we're connected
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current);
        connectTimeoutRef.current = null;
      }
      
      setConnectionStatus({
        connected: true,
        connecting: false,
        reconnecting: false
      });
      
      setError(null);
    });
    
    mqttClient.on('reconnect', () => {
      console.log('Attempting to reconnect to MQTT broker');
      setConnectionStatus(prev => ({ 
        ...prev, 
        reconnecting: true 
      }));
    });
    
    mqttClient.on('error', (err) => {
      console.error('MQTT connection error:', err);
      setError(err.message);
    });
    
    mqttClient.on('message', (topic, payload) => {
      const message: MqttMessage = {
        topic,
        payload: payload.toString(),
        timestamp: new Date()
      };
      setMessage(message);
    });
    
    mqttClient.on('disconnect', () => {
      console.log('Disconnected from MQTT broker');
      setConnectionStatus(prev => ({ 
        ...prev, 
        connected: false 
      }));
    });
    
    mqttClient.on('offline', () => {
      console.log('MQTT client is offline');
      setConnectionStatus({
        connected: false,
        connecting: false,
        reconnecting: false
      });
    });
    
    mqttClient.on('close', () => {
      console.log('MQTT connection closed');
      setConnectionStatus({
        connected: false,
        connecting: false,
        reconnecting: false
      });
    });
    
    // Set the client
    setClient(mqttClient);
    
  }, [brokerUrl, options, client, connectionStatus.connected, connectionStatus.connecting]);
  
  // Function to disconnect from the MQTT broker
  const disconnect = useCallback(() => {
    if (client) {
      client.end(true);
      setConnectionStatus({
        connected: false,
        connecting: false,
        reconnecting: false
      });
    }
    
    // Clear any pending timeouts
    if (connectTimeoutRef.current) {
      clearTimeout(connectTimeoutRef.current);
      connectTimeoutRef.current = null;
    }
  }, [client]);

  // Clean up effect
  useEffect(() => {
    return () => {
      // Clean up on component unmount
      if (client) {
        client.end(true);
      }
      
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current);
        connectTimeoutRef.current = null;
      }
    };
  }, [client]);
  
  // Function to subscribe to topics
  const subscribe = useCallback((topic: string) => {
    if (client && connectionStatus.connected) {
      client.subscribe(topic, (err: Error | null, granted?: ISubscriptionGrant[]) => {
        if (err) {
          console.error(`Error subscribing to ${topic}:`, err);
          setError(`Failed to subscribe to ${topic}: ${err.message}`);
        } else {
          console.log(`Subscribed to ${topic}`);
        }
      });
    } else {
      setError('Cannot subscribe: Not connected to broker');
    }
  }, [client, connectionStatus.connected]);

  // Function to publish messages
  const publish = useCallback((topic: string, message: string) => {
    if (client && connectionStatus.connected) {
      client.publish(topic, message, (err?: Error) => {
        if (err) {
          console.error(`Error publishing to ${topic}:`, err);
          setError(`Failed to publish to ${topic}: ${err.message}`);
        }
      });
    } else {
      setError('Cannot publish: Not connected to broker');
    }
  }, [client, connectionStatus.connected]);

  return {
    client,
    connectionStatus,
    message,
    error,
    connect,
    disconnect,
    subscribe,
    publish
  };
}