import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Music as MusicIcon } from 'lucide-react';
import { Track } from '../types';
import { motion, AnimatePresence } from 'motion/react';

const DUMMY_TRACKS: Track[] = [
  {
    id: '1',
    title: 'Cyberpunk Skyline',
    artist: 'Neural Synth',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    cover: 'https://picsum.photos/seed/cyber/400/400',
  },
  {
    id: '2',
    title: 'Neon Pulse',
    artist: 'Data Drift',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    cover: 'https://picsum.photos/seed/neon/400/400',
  },
  {
    id: '3',
    title: 'Digital Horizon',
    artist: 'Vector Flux',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    cover: 'https://picsum.photos/seed/digital/400/400',
  },
];

export const MusicPlayer: React.FC = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = DUMMY_TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const skipTrack = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      setCurrentTrackIndex((prev) => (prev + 1) % DUMMY_TRACKS.length);
    } else {
      setCurrentTrackIndex((prev) => (prev - 1 + DUMMY_TRACKS.length) % DUMMY_TRACKS.length);
    }
    setProgress(0);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(p || 0);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    if (audioRef.current) {
      audioRef.current.currentTime = (newProgress / 100) * audioRef.current.duration;
    }
  };

  return (
    <div className="w-full bg-[#151619] border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden relative group">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 blur-[100px] pointer-events-none"></div>

      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => skipTrack('next')}
      />

      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Track Art */}
        <div className="relative shrink-0">
          <motion.div
            key={currentTrack.id}
            initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            className="w-40 h-40 lg:w-48 lg:h-48 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-slate-700/50"
          >
            <img
              src={currentTrack.cover}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          {isPlaying && (
            <div className="absolute -bottom-2 -right-2 flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  animate={{ height: [8, 20, 12, 16, 8] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                  className="w-1 bg-cyan-400 rounded-full"
                />
              ))}
            </div>
          )}
        </div>

        {/* Info & Controls */}
        <div className="flex-1 w-full space-y-6">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-white tracking-tight">{currentTrack.title}</h3>
            <p className="text-slate-400 font-medium">{currentTrack.artist}</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progress}
              onChange={handleProgressChange}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition-all"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={() => skipTrack('prev')}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <SkipBack size={24} fill="currentColor" />
              </button>
              <button
                onClick={togglePlay}
                className="w-14 h-14 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} className="translate-x-0.5" fill="currentColor" />}
              </button>
              <button
                onClick={() => skipTrack('next')}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <SkipForward size={24} fill="currentColor" />
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-3 w-32">
              <Volume2 size={18} className="text-slate-500" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-400 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Playlist Preview */}
      <div className="mt-8 pt-6 border-t border-slate-800/50">
        <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
          <MusicIcon size={14} />
          Upcoming Tracks
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DUMMY_TRACKS.map((track, idx) => (
            <button
              key={track.id}
              onClick={() => {
                setCurrentTrackIndex(idx);
                setIsPlaying(true);
              }}
              className={`flex items-center gap-3 p-2 rounded-xl transition-all text-left ${
                idx === currentTrackIndex ? 'bg-cyan-500/10 border border-cyan-500/20' : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              <img src={track.cover} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
              <div className="min-w-0">
                <p className={`text-sm font-bold truncate ${idx === currentTrackIndex ? 'text-cyan-400' : 'text-slate-300'}`}>
                  {track.title}
                </p>
                <p className="text-[10px] text-slate-500 truncate">{track.artist}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
