import React, { useEffect, useState } from "react";
import { GameType, MessageData } from "../types";
import { GAMES } from "../constants";

interface BubbleProps {
  message: MessageData;
  gameType: GameType;
}

export const Bubble: React.FC<BubbleProps> = ({ message, gameType }) => {
  const [visible, setVisible] = useState(false);
  const theme = GAMES[gameType];

  useEffect(() => {
    // Trigger fade in after mount
    const timer = setTimeout(() => {
      setVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Inline styles for dynamic gradients based on hex codes provided
  const style: React.CSSProperties = {
    position: "absolute",
    left: `${message.x}%`,
    top: `${message.y}%`,
    background: `linear-gradient(to right, ${theme.gradientFrom}, ${theme.gradientTo})`,
    maxWidth: "400px",
    transform: visible ? "scale(1)" : "scale(0.9)",
    opacity: visible ? 1 : 0,
    transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
    // 1 pixel outline (white with opacity often looks better on gradients, or solid white)
    border: "1px solid rgba(255, 255, 255, 0.8)", 
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)",
    zIndex: Math.floor((message.timestamp ? new Date(message.timestamp).getTime() : Date.now()) / 1000)
  };

  return (
    <div
      style={style}
      className="rounded-3xl px-6 py-4 text-white font-bold tracking-wide pointer-events-none"
    >
      <p className="text-lg leading-tight drop-shadow-md">{message.text}</p>
      {message.author && (
        <p className="text-xs mt-2 opacity-90 text-right uppercase tracking-wider font-extrabold drop-shadow-sm">
          - {message.author}
        </p>
      )}
    </div>
  );
};
