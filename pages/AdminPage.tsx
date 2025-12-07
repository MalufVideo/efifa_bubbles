import React, { useState, useEffect, useCallback, useRef } from "react";
import { AppConfig, GameType, MessageData, DEFAULT_API_URL } from "../types";
import { GAMES } from "../constants";

const updateServerConfig = async (newConfig: Partial<AppConfig>) => {
  try {
    await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig)
    });
  } catch (err) {
    console.error("Failed to update server config:", err);
  }
};

export const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  
  const [config, setConfig] = useState<AppConfig>({
    game: GameType.EMOBILE,
    apiUrl: DEFAULT_API_URL,
    isAnimating: false,
    lastResetTimestamp: 0,
    fontSize: 18,
    deletedIds: []
  });
  const [messages, setMessages] = useState<MessageData[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [tempUrl, setTempUrl] = useState(DEFAULT_API_URL);
  const [isSaved, setIsSaved] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/config');
        if (res.ok) {
          const serverConfig = await res.json();
          setConfig(serverConfig);
          setTempUrl(serverConfig.apiUrl || DEFAULT_API_URL);
        }
      } catch (err) {
        console.error("Failed to fetch config:", err);
      }
    };
    fetchConfig();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "sp2efifa") {
      setIsAuthenticated(true);
    } else {
      alert("Senha incorreta");
    }
  };

  const handleGameSelect = (game: GameType) => {
    const newConfig = { ...config, game };
    setConfig(newConfig);
    updateServerConfig(newConfig);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempUrl(e.target.value);
    setIsSaved(false);
  };

  const handleSaveUrl = () => {
    const newConfig = { ...config, apiUrl: tempUrl };
    setConfig(newConfig);
    updateServerConfig(newConfig);
    setIsSaved(true);
  };

  const toggleAnimation = () => {
    const newConfig = { ...config, isAnimating: !config.isAnimating };
    setConfig(newConfig);
    updateServerConfig(newConfig);
  };

  const handleClear = () => {
    const newConfig = { ...config, lastResetTimestamp: Date.now() };
    setConfig(newConfig);
    updateServerConfig(newConfig);
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFontSize = parseInt(e.target.value, 10);
    const newConfig = { ...config, fontSize: newFontSize };
    setConfig(newConfig);
    updateServerConfig(newConfig);
  };

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/messages?_t=${Date.now()}`);
      if (!response.ok) return;
      const json = await response.json();
      let rawMessages: any[] = [];
      
      if (json.data && Array.isArray(json.data.messages)) {
        rawMessages = json.data.messages;
      } else if (json.messages && Array.isArray(json.messages)) {
        rawMessages = json.messages;
      } else if (json.data && Array.isArray(json.data)) {
        rawMessages = json.data;
      } else if (Array.isArray(json)) {
        rawMessages = json;
      }

      const parsed: MessageData[] = rawMessages.map((msg) => ({
        id: msg.id || `${msg.fan_name || 'anon'}-${msg.message}-${msg.created_at}`,
        text: msg.message || "No text",
        author: msg.fan_name,
        timestamp: msg.created_at
      }));
      
      setMessages(parsed.slice(-50).reverse());
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const handleDeleteMessage = (id: string | number) => {
    const newDeletedIds = [...(config.deletedIds || []), id];
    const newConfig = { ...config, deletedIds: newDeletedIds };
    setConfig(newConfig);
    updateServerConfig(newConfig);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">Acesso Admin</h1>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Digite a senha"
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors">
            Entrar
          </button>
        </form>
      </div>
    );
  }

  const activeMessages = messages.filter(m => !(config.deletedIds || []).includes(m.id));

  return (
    <div className="h-screen bg-gray-900 text-gray-100 p-4 flex flex-col overflow-hidden">
      <header className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Painel do Administrador</h1>
          <p className="text-gray-400 text-sm">Gerencie temas de jogos e feeds de mensagens em tempo real.</p>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
        {/* Left Column */}
        <div className="flex flex-col gap-4">
          {/* Game Selection */}
          <section className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700">
            <h2 className="text-lg font-semibold mb-3 text-white">Selecione o Tema do Jogo</h2>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(GAMES) as GameType[]).map((gameKey) => {
                const game = GAMES[gameKey];
                const isSelected = config.game === gameKey;
                return (
                  <button
                    key={gameKey}
                    onClick={() => handleGameSelect(gameKey)}
                    className={`relative overflow-hidden rounded-lg p-2 h-16 transition-all duration-200 border-2 flex items-center justify-center ${
                      isSelected ? "border-white scale-[1.02] shadow-xl" : "border-gray-600 hover:border-gray-400 opacity-70 hover:opacity-100"
                    }`}
                    style={{ background: `linear-gradient(to right, ${game.gradientFrom}, ${game.gradientTo})` }}
                  >
                    <span className="relative z-10 text-sm font-bold text-white drop-shadow-md uppercase tracking-wider">{game.label}</span>
                    {isSelected && (
                      <div className="absolute top-1 right-1 bg-white text-black rounded-full p-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* API Configuration + Messages */}
          <section className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700 flex-1 flex flex-col min-h-0">
            <h2 className="text-lg font-semibold mb-3 text-white">Fonte de Dados</h2>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400 mb-1">URL da API JSON de Mensagens</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tempUrl}
                  onChange={handleUrlChange}
                  className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://api.exemplo.com/mensagens"
                />
                <button
                  onClick={handleSaveUrl}
                  disabled={isSaved}
                  className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap ${
                    isSaved ? "bg-green-600/20 text-green-500 cursor-default" : "bg-blue-600 hover:bg-blue-500 text-white"
                  }`}
                >
                  {isSaved ? "Salvo" : "Salvar"}
                </button>
              </div>
            </div>
            
            {/* Messages List */}
            <div className="mt-3 flex-1 min-h-0 overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-2 flex-shrink-0">
                <p className="text-xs text-gray-400">Mensagens ({activeMessages.length} ativas)</p>
                {(config.deletedIds || []).length > 0 && (
                  <button
                    onClick={() => {
                      const newConfig = { ...config, deletedIds: [] };
                      setConfig(newConfig);
                      updateServerConfig(newConfig);
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Restaurar todas
                  </button>
                )}
              </div>
              <div ref={messagesContainerRef} className="flex-1 overflow-y-scroll space-y-1 pr-1 min-h-0" style={{ maxHeight: '500px' }}>
                {activeMessages.map((msg) => (
                  <div key={msg.id} className="relative bg-gray-900 rounded-lg p-2 pr-8 group">
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-600 text-gray-500 hover:text-white transition-all opacity-50 group-hover:opacity-100"
                      title="Remover do broadcast"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                    <p className="text-xs text-white truncate">{msg.text}</p>
                    {msg.author && <p className="text-xs text-gray-500 truncate">- {msg.author}</p>}
                  </div>
                ))}
                {messages.length === 0 && <p className="text-xs text-gray-500 text-center py-4">Nenhuma mensagem</p>}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4">
          {/* Layout Controls */}
          <section className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700">
            <h2 className="text-lg font-semibold mb-3 text-white">Controles de Layout</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Tamanho da Fonte: <span className="text-white font-bold">{config.fontSize}px</span>
                </label>
                <input
                  type="range"
                  min="12"
                  max="48"
                  value={config.fontSize}
                  onChange={handleFontSizeChange}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>12px</span>
                  <span>30px</span>
                  <span>48px</span>
                </div>
              </div>
              <div className="p-3 bg-gray-900 rounded-lg">
                <p className="text-xs text-gray-400 mb-2">Pré-visualização:</p>
                <div 
                  className="inline-block rounded-2xl px-4 py-2 text-white font-bold tracking-wide"
                  style={{
                    background: `linear-gradient(to right, ${GAMES[config.game].gradientFrom}, ${GAMES[config.game].gradientTo})`,
                    fontSize: `${Math.min(config.fontSize, 24)}px`,
                    lineHeight: '1.25',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
                  }}
                >
                  <p>Exemplo!</p>
                  <p className="text-right uppercase tracking-wider font-extrabold opacity-90 mt-1" style={{ fontSize: `${Math.max(8, Math.min(config.fontSize, 24) * 0.65)}px` }}>- Autor</p>
                </div>
              </div>
            </div>
          </section>

          {/* Animation Controls - Always visible */}
          <section className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700 flex flex-col items-center justify-center text-center">
            <h2 className="text-xl font-bold mb-1 text-white">Controle de Transmissão</h2>
            <p className="text-gray-400 text-sm mb-4">Inicie a animação para buscar e exibir mensagens.</p>

            <div className="flex items-center gap-4">
              <button
                onClick={handleClear}
                className="w-28 h-14 rounded-full text-base font-bold tracking-widest uppercase transition-all hover:scale-105 active:scale-95 shadow-xl bg-gray-700 hover:bg-gray-600 text-gray-200 border-2 border-gray-500"
              >
                Apagar
              </button>

              <button
                onClick={toggleAnimation}
                className={`w-40 h-14 rounded-full text-lg font-bold tracking-widest uppercase transition-all hover:scale-105 active:scale-95 shadow-xl ${
                  config.isAnimating ? "bg-red-600 hover:bg-red-500 text-white" : "bg-green-600 hover:bg-green-500 text-white"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  {config.isAnimating ? (
                    <>
                      <span className="w-3 h-3 bg-white rounded-sm animate-pulse"></span>
                      Parar
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Iniciar
                    </>
                  )}
                </span>
              </button>
            </div>
            
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              <div className={`w-2 h-2 rounded-full ${config.isAnimating ? 'bg-green-500 animate-ping' : 'bg-gray-600'}`}></div>
              Status: {config.isAnimating ? "AO VIVO" : "OFFLINE"}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
