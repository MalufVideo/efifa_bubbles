import React, { useEffect, useState, useRef, useCallback } from "react";
import { AppConfig, GameType, MessageData } from "../types";
import { getConfig } from "../services/storageService";
import { Bubble } from "../components/Bubble";

// Helper to get URL search params without React Router
const getUrlSearchParams = () => {
  if (typeof window !== 'undefined') {
    return new URLSearchParams(window.location.search);
  }
  return new URLSearchParams();
};

// Fixed Resolution
const CANVAS_WIDTH = 3840;
const CANVAS_HEIGHT = 640;

export const BroadcastPage: React.FC = () => {
  // Set transparent background for OBS/streaming overlay
  useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = 'transparent';
    document.documentElement.style.backgroundColor = 'transparent';

    return () => {
      document.body.style.backgroundColor = originalBg;
      document.documentElement.style.backgroundColor = originalBg;
    };
  }, []);

  // Initialize config merging LocalStorage with URL Parameters
  // URL params take precedence for separate computer setup
  const [config, setConfig] = useState<AppConfig>(() => {
    const local = getConfig();
    const searchParams = getUrlSearchParams();
    const urlGame = searchParams.get('game') as GameType;
    const urlApi = searchParams.get('api');
    const urlAnim = searchParams.get('anim');

    return {
      game: urlGame || local.game,
      apiUrl: urlApi || local.apiUrl,
      // If 'anim' is present in URL, force that state, otherwise use local
      isAnimating: urlAnim ? (urlAnim === 'true') : local.isAnimating,
      lastResetTimestamp: local.lastResetTimestamp
    };
  });

  const [messages, setMessages] = useState<MessageData[]>([]);
  const processedIds = useRef<Set<string | number>>(new Set());
  const pollInterval = useRef<number | null>(null);
  const lastKnownReset = useRef<number>(config.lastResetTimestamp);

  // Sync config from local storage (if on same machine)
  useEffect(() => {
    const handleStorageChange = () => {
      // If we are relying on URL params (e.g. on a 2nd computer), 
      // we generally ignore local storage updates unless we want to support hybrid.
      // But for "Clear" functionality on same machine, we need to listen.
      const newConfig = getConfig();
      setConfig(prev => ({...prev, ...newConfig}));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Handle Reset Signal
  useEffect(() => {
    if (config.lastResetTimestamp > lastKnownReset.current) {
      setMessages([]);
      processedIds.current.clear();
      lastKnownReset.current = config.lastResetTimestamp;
    }
  }, [config.lastResetTimestamp]);

  const fetchMessages = useCallback(async () => {
    if (!config.apiUrl) return;

    try {
      const response = await fetch(config.apiUrl);
      const data = await response.json();

      let newRawMessages: any[] = [];
      if (Array.isArray(data)) {
        newRawMessages = data;
      } else if (data.data?.messages && Array.isArray(data.data.messages)) {
        // Handle nested structure: { success: true, data: { messages: [...] } }
        newRawMessages = data.data.messages;
      } else if (data.messages && Array.isArray(data.messages)) {
        newRawMessages = data.messages;
      }

      const newItems: MessageData[] = [];

      newRawMessages.forEach((msg) => {
        const id = msg.id || `${msg.fan_name}-${msg.message}-${Date.now()}`;

        if (!processedIds.current.has(id)) {
          processedIds.current.add(id);

          const x = Math.random() * 85;
          const y = Math.random() * 75;

          newItems.push({
            id: id,
            message: msg.message || msg.text || "",
            fan_name: msg.fan_name || null,
            timestamp: msg.created_at || msg.timestamp || new Date().toISOString(),
            x,
            y
          });
        }
      });

      if (newItems.length > 0) {
        setMessages((prev) => {
          const combined = [...prev, ...newItems];
          if (combined.length > 50) {
             return combined.slice(combined.length - 50);
          }
          return combined;
        });
      }

    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [config.apiUrl]);

  useEffect(() => {
    if (config.isAnimating) {
      fetchMessages();
      pollInterval.current = window.setInterval(fetchMessages, 3000);
    } else {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    }

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [config.isAnimating, fetchMessages]);

  return (
    <div 
      style={{ 
        width: `${CANVAS_WIDTH}px`, 
        height: `${CANVAS_HEIGHT}px`,
        backgroundColor: 'transparent'
      }}
      className="relative overflow-hidden"
    >
      {messages.map((msg) => (
        <Bubble 
          key={msg.id} 
          message={msg} 
          gameType={config.game} 
        />
      ))}
      
      {/* Page is blank/transparent when not animating - ready for OBS overlay */}
    </div>
  );
};
