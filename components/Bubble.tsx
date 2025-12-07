import React, { useEffect, useState } from "react";
import { GameType, MessageData } from "../types";
import { GAMES } from "../constants";

interface BubbleProps {
  message: MessageData;
  gameType: GameType;
  fontSize?: number;
}

export const Bubble: React.FC<BubbleProps> = ({ message, gameType, fontSize = 18 }) => {
  const [visible, setVisible] = useState(false);
  // Fallback to EMOBILE if gameType is somehow undefined to prevent crash
  const theme = GAMES[gameType] || GAMES[GameType.EMOBILE];

  useEffect(() => {
    // Trigger fade in after mount using requestAnimationFrame for better timing
    const timer = requestAnimationFrame(() => {
        setVisible(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  // Calculate dynamic sizing based on font size
  const baseFontSize = 18;
  const scaleFactor = fontSize / baseFontSize;
  const padding = `${Math.round(16 * scaleFactor)}px ${Math.round(24 * scaleFactor)}px`;
  const maxWidth = Math.round(400 * scaleFactor);
  const authorFontSize = Math.max(10, Math.round(fontSize * 0.65));

  // Inline styles for dynamic gradients
  const style: React.CSSProperties = {
    position: "absolute",
    left: `${message.x}%`,
    top: `${message.y}%`,
    background: `linear-gradient(to right, ${theme.gradientFrom}, ${theme.gradientTo})`,
    maxWidth: `${maxWidth}px`,
    padding,
    fontSize: `${fontSize}px`,
    lineHeight: '1.25',
    // Start smaller (0.5) to create a 'pop' effect when scaling to 1
    transform: visible ? "scale(1)" : "scale(0.5)",
    opacity: visible ? 1 : 0,
    // Faster duration (0.4s) and a bouncier spring effect
    transition: "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease-out",
    border: "1px solid rgba(255, 255, 255, 0.8)", 
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)",
    zIndex: 10
  };

  return (
    <div
      style={style}
      className="rounded-3xl text-white font-bold tracking-wide pointer-events-none"
    >
      <p className="leading-tight drop-shadow-md">{message.text}</p>
      {message.author && (
        <p 
          className="mt-2 opacity-90 text-right uppercase tracking-wider font-extrabold drop-shadow-sm"
          style={{ fontSize: `${authorFontSize}px` }}
        >
          - {message.author}
        </p>
      )}
    </div>
  );
};