import React, { useState, useEffect } from "react";
import { AppConfig, GameType } from "../types";
import { GAMES } from "../constants";
import { getConfig, saveConfig } from "../services/storageService";

export const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  
  const [config, setConfig] = useState<AppConfig>(getConfig());
  const [tempUrl, setTempUrl] = useState(config.apiUrl);
  const [isSaved, setIsSaved] = useState(true);
  const [generatedLink, setGeneratedLink] = useState("");

  // Poll for external changes (local storage sync within same browser)
  useEffect(() => {
    const handleStorageChange = () => {
      const newConfig = getConfig();
      setConfig((prev) => 
        JSON.stringify(prev) !== JSON.stringify(newConfig) ? newConfig : prev
      );
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Update the generated link whenever config changes
  useEffect(() => {
    // Generate a hash-based link that works in preview and production
    // e.g., https://nelsonoliveira.com/bubbles/#/broadcast?game=...
    const baseUrl = window.location.href.split('#')[0];
    const params = new URLSearchParams();
    params.set('game', config.game);
    params.set('api', config.apiUrl);
    params.set('anim', config.isAnimating ? 'true' : 'false');
    
    const link = `${baseUrl}#/broadcast?${params.toString()}`;
    setGeneratedLink(link);
  }, [config]);

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
    saveConfig(newConfig);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempUrl(e.target.value);
    setIsSaved(false);
  };

  const handleSaveUrl = () => {
    const newConfig = { ...config, apiUrl: tempUrl };
    setConfig(newConfig);
    saveConfig(newConfig);
    setIsSaved(true);
  };

  const toggleAnimation = () => {
    const newConfig = { ...config, isAnimating: !config.isAnimating };
    setConfig(newConfig);
    saveConfig(newConfig);
  };

  const handleClear = () => {
    // Update timestamp to trigger clear in listeners
    const newConfig = { ...config, lastResetTimestamp: Date.now() };
    setConfig(newConfig);
    saveConfig(newConfig);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    alert("Link copiado para a área de transferência!");
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
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-8">
        <header className="flex justify-between items-center border-b border-gray-700 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Painel do Administrador
            </h1>
            <p className="text-gray-400 mt-2">
              Gerencie temas de jogos e feeds de mensagens em tempo real.
            </p>
          </div>
        </header>

        {/* Game Selection */}
        <section className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-white">Selecione o Tema do Jogo</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Object.keys(GAMES) as GameType[]).map((gameKey) => {
              const game = GAMES[gameKey];
              const isSelected = config.game === gameKey;
              return (
                <button
                  key={gameKey}
                  onClick={() => handleGameSelect(gameKey)}
                  className={`relative overflow-hidden rounded-lg p-4 h-24 transition-all duration-200 border-2 flex items-center justify-center ${
                    isSelected
                      ? "border-white scale-[1.02] shadow-xl"
                      : "border-gray-600 hover:border-gray-400 opacity-70 hover:opacity-100"
                  }`}
                  style={{
                    background: `linear-gradient(to right, ${game.gradientFrom}, ${game.gradientTo})`
                  }}
                >
                  <span className="relative z-10 text-xl font-bold text-white drop-shadow-md uppercase tracking-wider">
                    {game.label}
                  </span>
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-white text-black rounded-full p-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* API Configuration */}
        <section className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-white">Fonte de Dados</h2>
          <div className="flex gap-4 items-end">
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                URL da API JSON de Mensagens
              </label>
              <input
                type="text"
                value={tempUrl}
                onChange={handleUrlChange}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="https://api.exemplo.com/mensagens"
              />
            </div>
            <button
              onClick={handleSaveUrl}
              disabled={isSaved}
              className={`px-6 py-3 rounded-lg font-bold transition-all ${
                isSaved
                  ? "bg-green-600/20 text-green-500 cursor-default"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-blue-500/20"
              }`}
            >
              {isSaved ? "Salvo" : "Salvar URL"}
            </button>
          </div>
        </section>

        {/* Animation Controls */}
        <section className="bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-700 flex flex-col items-center justify-center text-center">
          <h2 className="text-2xl font-bold mb-2 text-white">Controle de Transmissão</h2>
          <p className="text-gray-400 mb-8 max-w-md">
            Inicie a animação para começar a buscar mensagens e exibi-las no mural.
          </p>

          <div className="flex items-center gap-6">
            <button
              onClick={handleClear}
              className="group relative w-40 h-20 rounded-full text-xl font-bold tracking-widest uppercase transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-2xl bg-gray-700 hover:bg-gray-600 text-gray-200 border-2 border-gray-500"
            >
              Apagar
            </button>

            <button
              onClick={toggleAnimation}
              className={`
                  group relative w-64 h-20 rounded-full text-2xl font-bold tracking-widest uppercase transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-2xl
                  ${
                    config.isAnimating
                      ? "bg-red-600 hover:bg-red-500 text-white shadow-red-900/50"
                      : "bg-green-600 hover:bg-green-500 text-white shadow-green-900/50"
                  }
              `}
            >
              <span className="flex items-center justify-center gap-3">
                {config.isAnimating ? (
                  <>
                    <span className="w-4 h-4 bg-white rounded-sm animate-pulse"></span>
                    Parar
                  </>
                ) : (
                  <>
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Iniciar
                  </>
                )}
              </span>
            </button>
          </div>
          
          <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
             <div className={`w-2 h-2 rounded-full ${config.isAnimating ? 'bg-green-500 animate-ping' : 'bg-gray-600'}`}></div>
             Status: {config.isAnimating ? "AO VIVO" : "OFFLINE"}
          </div>
        </section>
      </div>
    </div>
  );
};