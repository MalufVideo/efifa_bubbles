import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { AppConfig, GameType, MessageData } from "../types";
import { getConfig } from "../services/storageService";
import { Bubble } from "../components/Bubble";

// Fixed Resolution
const CANVAS_WIDTH = 3840;
const CANVAS_HEIGHT = 640;

export const BroadcastPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  // Initialize config merging LocalStorage with URL Parameters
  const [config, setConfig] = useState<AppConfig>(() => {
    const local = getConfig();
    const urlGame = searchParams.get('game') as GameType;
    const urlApi = searchParams.get('api');
    const urlAnim = searchParams.get('anim');

    return {
      game: urlGame || local.game,
      apiUrl: urlApi || local.apiUrl,
      isAnimating: urlAnim ? (urlAnim === 'true') : local.isAnimating,
      lastResetTimestamp: local.lastResetTimestamp
    };
  });

  const [messages, setMessages] = useState<MessageData[]>([]);
  // We track processed IDs to prevent "zombies" from reappearing after a fetch
  const processedIds = useRef<Set<string | number>>(new Set());
  const pollInterval = useRef<number | null>(null);
  const lastKnownReset = useRef<number>(config.lastResetTimestamp);

  // Force both html and body backgrounds to be transparent when on this page
  // This overrides the 'bg-gray-900' or similar set in index.html
  // Both elements must be transparent to avoid white background showing through
  useEffect(() => {
    const originalBodyBackground = document.body.style.backgroundColor;
    const originalHtmlBackground = document.documentElement.style.backgroundColor;

    document.body.style.backgroundColor = 'transparent';
    document.documentElement.style.backgroundColor = 'transparent';

    return () => {
      // Revert when leaving the broadcast page
      document.body.style.backgroundColor = originalBodyBackground || '';
      document.documentElement.style.backgroundColor = originalHtmlBackground || '';
    };
  }, []);

  // Sync config from local storage (if on same machine/browser context)
  useEffect(() => {
    const handleStorageChange = () => {
      const newConfig = getConfig();
      console.log("Broadcast received config update:", newConfig);
      // We merge to ensure we get the latest 'isAnimating' and 'lastResetTimestamp'
      setConfig(prev => ({
        ...prev,
        game: newConfig.game, // Sync game theme
        isAnimating: newConfig.isAnimating, // Sync play/stop
        lastResetTimestamp: newConfig.lastResetTimestamp, // Sync clear
        apiUrl: newConfig.apiUrl // Sync API
      }));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Handle Reset Signal (Apagar)
  useEffect(() => {
    if (config.lastResetTimestamp > lastKnownReset.current) {
      console.log("Broadcast executing CLEAR command");
      setMessages([]); // Wipe visual elements
      // NOTE: We do NOT clear processedIds. This ensures that old messages 
      // from the API history don't immediately flood back in. 
      // Only NEW messages (IDs we haven't seen) will appear.
      lastKnownReset.current = config.lastResetTimestamp;
    }
  }, [config.lastResetTimestamp]);

  const fetchMessages = useCallback(async () => {
    if (!config.apiUrl) return;

    try {
      const response = await fetch(config.apiUrl);
      const json = await response.json();

      let newRawMessages: any[] = [];
      
      // Handle payload schema: {"success":true, "data": { "messages": [...] }}
      if (json.data && Array.isArray(json.data.messages)) {
        newRawMessages = json.data.messages;
      } 
      // Fallback: { messages: [] }
      else if (json.messages && Array.isArray(json.messages)) {
        newRawMessages = json.messages;
      } 
      // Fallback: Array directly
      else if (Array.isArray(json)) {
        newRawMessages = json;
      }

      const newItems: MessageData[] = [];
      
      newRawMessages.forEach((msg) => {
        // Use ID from API or fallback to composite key
        const id = msg.id || `${msg.fan_name || 'anon'}-${msg.message}-${msg.created_at}`;
        
        if (!processedIds.current.has(id)) {
          processedIds.current.add(id);
          
          const x = Math.random() * 85; 
          const y = Math.random() * 75;

          // Map API fields to internal MessageData structure
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
        setMessages((prev) => {
          const combined = [...prev, ...newItems];
          // Keep a manageable buffer size to prevent memory issues
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

  // Handle Animation Loop (Iniciar / Parar)
  useEffect(() => {
    if (config.isAnimating) {
      console.log("Starting animation loop...");
      fetchMessages(); // Immediate fetch
      pollInterval.current = window.setInterval(fetchMessages, 3000);
    } else {
      console.log("Stopping animation loop...");
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
        pollInterval.current = null;
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
      
      {/* 
        No placeholder text is rendered here. 
        Background is handled by useEffect clearing the document body color.
        If logic ensures empty div if no messages.
      */}
    </div>
  );
};