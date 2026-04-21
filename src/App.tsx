/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { SnakeGame } from './components/SnakeGame';
import { MusicPlayer } from './components/MusicPlayer';
import { GameStatus } from './types';
import { Trophy, Music, Zap, Radio } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.IDLE);

  const handleScoreChange = (newScore: number) => {
    setScore(newScore);
    if (newScore > bestScore) {
      setBestScore(newScore);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-white selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-600/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-cyan-600/5 blur-[120px] rounded-full" />
      </div>

      <main className="relative container mx-auto px-4 py-12 flex flex-col items-center gap-10">
        {/* Header */}
        <header className="w-full max-w-4xl flex flex-col md:flex-row justify-between items-center gap-6 mb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              <Zap className="text-cyan-400 w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-sans font-black tracking-tighter text-white uppercase italic">
                BEATS <span className="text-cyan-400">&</span> BITES
              </h1>
              <p className="text-slate-500 text-xs font-mono font-medium tracking-[0.2em] uppercase">Synthwave Arcade Studio</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center gap-3 bg-slate-900/50 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-800 shadow-xl">
              <Trophy size={18} className="text-yellow-500" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-black leading-none mb-1">SCORE</p>
                <p className="text-xl font-mono font-bold leading-none text-cyan-400 tracking-tighter">{score.toString().padStart(4, '0')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-slate-900/50 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-800 shadow-xl">
              <Radio size={18} className="text-purple-500" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-black leading-none mb-1">BEST</p>
                <p className="text-xl font-mono font-bold leading-none text-purple-400 tracking-tighter">{bestScore.toString().padStart(4, '0')}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Game Window */}
        <section className="w-full max-w-lg">
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-2 h-2 rounded-full ${gameStatus === GameStatus.PLAYING ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">ARCADE_SERVER_01 // {gameStatus}</span>
          </div>
          <SnakeGame 
            onScoreChange={handleScoreChange} 
            gameStatus={gameStatus}
            setGameStatus={setGameStatus}
          />
        </section>

        {/* Music Player */}
        <section className="w-full max-w-4xl mt-4">
          <div className="flex items-center gap-2 mb-4">
            <Music size={14} className="text-slate-500" />
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">AUDIO_LINK_ACTIVE</span>
          </div>
          <MusicPlayer />
        </section>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-slate-600 text-[10px] uppercase tracking-[0.3em] font-mono">
            Built with React & Tailwind // Protocol Neon-v2.4
          </p>
        </footer>
      </main>
    </div>
  );
}
