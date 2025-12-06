import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { AppConfig, GameType, MessageData, DEFAULT_API_URL } from "../types";
import { getConfig } from "../services/storageService";
import { Bubble } from "../components/Bubble";

export const BroadcastPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  // Initialize config merging LocalStorage with URL Parameters
  const [config, setConfig] = useState<AppConfig>(() => {
    const local = getConfig();
    const urlGame = searchParams.get('game') as GameType;
    const urlApi = searchParams.get('api');
    const urlAnim = searchParams.get('anim');

    // Default to true for broadcast view
    const shouldAnimate = urlAnim !== null ? (urlAnim === 'true') : true;

    // Ensure we have a valid API URL, fallback to default if missing
    // Priority: URL Param -> Local Storage -> Default Constant
    const validApiUrl = urlApi || local.apiUrl || DEFAULT_API_URL;

    return {
      game: urlGame || local.game,
      apiUrl: validApiUrl,
      isAnimating: shouldAnimate,
      lastResetTimestamp: local.lastResetTimestamp
    };
  });

  const [messages, setMessages] = useState<MessageData[]>([]);
  const processedIds = useRef<Set<string | number>>(new Set());
  const pollInterval = useRef<number | null>(null);
  const lastKnownReset = useRef<number>(config.lastResetTimestamp);

  // Force body and html background to be transparent
  useEffect(() => {
    const originalBodyBackground = document.body.style.backgroundColor;
    const originalHtmlBackground = document.documentElement.style.backgroundColor;
    
    document.body.style.backgroundColor = 'transparent';
    document.documentElement.style.backgroundColor = 'transparent';

    return () => {
      document.body.style.backgroundColor = originalBodyBackground || '';
      document.documentElement.style.backgroundColor = originalHtmlBackground || '';
    };
  }, []);

  // Sync config from local storage
  useEffect(() => {
    const handleStorageChange = () => {
      const newConfig = getConfig();
      console.log("Broadcast received config update:", newConfig);
      setConfig(prev => ({
        ...prev,
        game: newConfig.game,
        isAnimating: newConfig.isAnimating,
        lastResetTimestamp: newConfig.lastResetTimestamp,
        // If the new config has an API URL, use it, otherwise keep current or default
        apiUrl: newConfig.apiUrl || prev.apiUrl || DEFAULT_API_URL
      }));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Handle Reset Signal
  useEffect(() => {
    if (config.lastResetTimestamp > lastKnownReset.current) {
      console.log("Broadcast executing CLEAR command");
      setMessages([]);
      // We do NOT clear processedIds to prevent old messages from re-flooding
      lastKnownReset.current = config.lastResetTimestamp;
    }
  }, [config.lastResetTimestamp]);

  const fetchMessages = useCallback(async () => {
    // Explicitly fallback to default if config.apiUrl is empty string
    const targetUrl = config.apiUrl || DEFAULT_API_URL;
    if (!targetUrl) return;

    try {
      // Add timestamp to prevent caching
      const separator = targetUrl.includes('?') ? '&' : '?';
      const fetchUrl = `${targetUrl}${separator}_t=${Date.now()}`;

      const response = await fetch(fetchUrl, {
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

      if (newItems.length > 0) {
        console.log(`Adding ${newItems.length} new bubbles`);
        setMessages((prev) => {
          const combined = [...prev, ...newItems];
          // Limit total bubbles on screen to prevent performance degradation
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
    </div>
  );
};