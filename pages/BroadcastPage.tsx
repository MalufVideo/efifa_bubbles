import React, { useEffect, useState, useRef, useCallback } from "react";
import { AppConfig, GameType, MessageData, DEFAULT_API_URL } from "../types";
import { Bubble } from "../components/Bubble";

// Fixed canvas size for broadcast overlay (aspect ratio 6:1)
const CANVAS_WIDTH = 3840;
const CANVAS_HEIGHT = 640;

export const BroadcastPage: React.FC = () => {
  // Initialize config - auto-start animation by default
  const [config, setConfig] = useState<AppConfig>({
    game: GameType.EMOBILE,
    apiUrl: DEFAULT_API_URL,
    isAnimating: true, // Auto-start by default
    lastResetTimestamp: 0,
    fontSize: 18,
    deletedIds: []
  });

  const [messages, setMessages] = useState<MessageData[]>([]);
  const processedIds = useRef<Set<string | number>>(new Set());
  const pollInterval = useRef<number | null>(null);
  const configPollInterval = useRef<number | null>(null);
  const lastKnownReset = useRef<number>(0);

  // Force body and html background to be transparent
  useEffect(() => {
    document.body.style.backgroundColor = 'transparent';
    document.documentElement.style.backgroundColor = 'transparent';
    document.body.style.overflow = 'hidden';
  }, []);

  // Poll server for config updates (admin controls)
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/config');
        if (res.ok) {
          const serverConfig = await res.json();
          setConfig(prev => ({
            ...prev,
            game: serverConfig.game || prev.game,
            apiUrl: serverConfig.apiUrl || prev.apiUrl,
            isAnimating: serverConfig.isAnimating ?? prev.isAnimating,
            lastResetTimestamp: serverConfig.lastResetTimestamp ?? prev.lastResetTimestamp,
            fontSize: serverConfig.fontSize ?? prev.fontSize,
            deletedIds: serverConfig.deletedIds ?? prev.deletedIds
          }));
        }
      } catch (err) {
        console.error("Failed to fetch config:", err);
      }
    };

    fetchConfig(); // Initial fetch
    configPollInterval.current = window.setInterval(fetchConfig, 1000); // Poll every second

    return () => {
      if (configPollInterval.current) clearInterval(configPollInterval.current);
    };
  }, []);

  // Handle Reset Signal
  useEffect(() => {
    if (config.lastResetTimestamp > lastKnownReset.current) {
      console.log("Broadcast executing CLEAR command - resetting everything");
      setMessages([]);
      processedIds.current.clear(); // Clear so messages can animate again
      lastKnownReset.current = config.lastResetTimestamp;
    }
  }, [config.lastResetTimestamp]);

  const fetchMessages = useCallback(async () => {
    try {
      // Use server proxy to bypass CORS issues
      const response = await fetch(`/api/messages?_t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();
      let newRawMessages: any[] = [];
      
      // Robust JSON Parsing Strategies
      if (json.data && Array.isArray(json.data.messages)) {
        // { data: { messages: [...] } }
        newRawMessages = json.data.messages;
      } else if (json.messages && Array.isArray(json.messages)) {
        // { messages: [...] }
        newRawMessages = json.messages;
      } else if (json.data && Array.isArray(json.data)) {
        // { data: [...] }
        newRawMessages = json.data;
      } else if (Array.isArray(json)) {
        // [...]
        newRawMessages = json;
      }

      const newItems: MessageData[] = [];
      
      newRawMessages.forEach((msg) => {
        // Use ID from API or fallback to composite key
        const id = msg.id || `${msg.fan_name || 'anon'}-${msg.message}-${msg.created_at}`;
        
        if (!processedIds.current.has(id)) {
          processedIds.current.add(id);
          
          // Randomize position: x (5% to 80%), y (5% to 75%)
          // Using slightly safer bounds to prevent overflow
          const x = 5 + Math.random() * 75; 
          const y = 5 + Math.random() * 70;

          newItems.push({
            id: id,
            text: msg.message || "No text",
            author: msg.fan_name, 
            timestamp: msg.created_at || new Date().toISOString(),
            x,
            y
          });
        }
      });

      // Stagger bubble additions - one every 300ms for smooth animation
      if (newItems.length > 0) {
        console.log(`Queuing ${newItems.length} new bubbles for staggered display`);
        newItems.forEach((item, index) => {
          setTimeout(() => {
            setMessages((prev) => {
              const combined = [...prev, item];
              // Limit total bubbles on screen
              if (combined.length > 50) {
                return combined.slice(combined.length - 50);
              }
              return combined;
            });
          }, index * 300); // 300ms delay between each bubble
        });
      }

    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [config.apiUrl]);

  // Handle Animation Loop
  useEffect(() => {
    // Clear any existing interval first
    if (pollInterval.current) {
      clearInterval(pollInterval.current);
      pollInterval.current = null;
    }

    if (config.isAnimating) {
      console.log("Starting animation loop... URL:", config.apiUrl);
      fetchMessages(); // Immediate fetch
      // Poll every 3 seconds for faster updates
      pollInterval.current = window.setInterval(fetchMessages, 3000);
    } else {
      console.log("Stopping animation loop...");
    }

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [config.isAnimating, fetchMessages]);

  return (
    <div 
      style={{ 
        width: '100vw', 
        height: '100vh',
        backgroundColor: 'transparent',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Debug indicator - remove in production if needed */}
      {messages.length === 0 && (
        <div style={{ 
          position: 'absolute', 
          top: 10, 
          left: 10, 
          color: 'rgba(255,255,255,0.3)', 
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          {config.isAnimating ? 'Waiting for messages...' : 'Animation paused'}
        </div>
      )}
      {messages.filter(msg => !(config.deletedIds || []).includes(msg.id)).map((msg) => (
        <Bubble 
          key={msg.id} 
          message={msg} 
          gameType={config.game}
          fontSize={config.fontSize}
        />
      ))}
    </div>
  );
};