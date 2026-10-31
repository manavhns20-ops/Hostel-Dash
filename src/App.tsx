/**
 * Hostel Dash: The 8 AM Nightmare
 * Complete 2D Side-Scrolling Pixel-Art Platformer
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { GameStatus, GameStats } from './game/types';
import { sound } from './game/audio';
import {
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Pause,
  Award,
  Clock,
  Heart,
  Zap,
  BookOpen,
  ArrowRight,
  Code2,
  Download,
  Github,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameStatus, setGameStatus] = useState<GameStatus>('TITLE');
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    timeRemaining: 90,
    totalTime: 90,
    lives: 3,
    hasIdCard: false,
    collectiblesCount: { coffee: 0, assignments: 0, coupons: 0 },
    distanceCovered: 0,
    currentZone: 'Hostel Room',
    currentObjective: 'Find your ID Card on the shelf & head out the door!',
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastTimer, setToastTimer] = useState<number | null>(null);
  const [showSubmissionKit, setShowSubmissionKit] = useState<boolean>(false);

  // Initialize Engine
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const engine = new GameEngine(canvas);
    engineRef.current = engine;

    engine.setCallbacks({
      onStatusChange: (status) => setGameStatus(status),
      onStatsChange: (newStats) => setStats(newStats),
      onToast: (msg) => {
        setToastMessage(msg);
        if (toastTimer) clearTimeout(toastTimer);
        const timer = window.setTimeout(() => setToastMessage(null), 3800);
        setToastTimer(timer);
      },
    });

    // Start title screen idle preview loop
    engine.loop(performance.now());

    return () => {
      engine.destroy();
      if (toastTimer) clearTimeout(toastTimer);
    };
  }, []);

  // Format In-Game Campus Clock (7:55 AM -> 8:00 AM)
  const formatCampusClock = useCallback((remainingSecs: number, totalSecs: number) => {
    const elapsed = Math.max(0, totalSecs - remainingSecs);
    const inGameSecs = Math.min(300, Math.floor((elapsed / totalSecs) * 300));
    const minutes = 55 + Math.floor(inGameSecs / 60);
    const seconds = inGameSecs % 60;

    if (minutes >= 60 || remainingSecs <= 0) {
      return '08:00:00 AM';
    }
    return `07:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} AM`;
  }, []);

  const handleStartGame = () => {
    sound.unlock();
    engineRef.current?.startCountdown();
  };

  const handleResume = () => {
    engineRef.current?.resume();
  };

  const handleRestart = () => {
    engineRef.current?.restart();
  };

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleBackToTitle = () => {
    engineRef.current?.resetLevel();
    engineRef.current?.setStatus('TITLE');
  };

  // Virtual touch controls for mobile testing
  const handleTouchStart = (action: 'left' | 'right' | 'jump') => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    engineRef.current?.setVirtualInput(action, true);
  };

  const handleTouchEnd = (action: 'left' | 'right' | 'jump') => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    engineRef.current?.setVirtualInput(action, false);
  };

  // Keyboard shortcut listener for Enter / Space on start/victory/gameover
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        if (gameStatus === 'TITLE' || gameStatus === 'VICTORY' || gameStatus === 'GAMEOVER') {
          e.preventDefault();
          handleStartGame();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameStatus]);

  // Humorous victory subtitle generator
  const getVictoryMessage = () => {
    const quotes = [
      'Attendance secured! Sleep schedule completely destroyed.',
      'Professor Sharma is visibly shocked. You are somehow on time!',
      'Your ancestors are proud. Your roommate is still fast asleep.',
      'You dodged Warden Verma and achieved legendary hostel status!',
    ];
    return quotes[Math.floor(stats.score) % quotes.length];
  };

  const getRankBadgeColor = (rank?: string) => {
    switch (rank) {
      case 'S': return 'text-amber-400 bg-amber-950/80 border-amber-500/50';
      case 'A': return 'text-emerald-400 bg-emerald-950/80 border-emerald-500/50';
      case 'B': return 'text-sky-400 bg-sky-950/80 border-sky-500/50';
      default: return 'text-rose-400 bg-rose-950/80 border-rose-500/50';
    }
  };

  return (
    <div className="relative w-screen h-screen bg-[#07090e] flex items-center justify-center overflow-hidden font-sans select-none">
      {/* Isolated Pixel-Art Game Canvas Container */}
      <div className="relative w-full h-full max-w-[1920px] max-h-[1080px] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={960}
          height={540}
          className="w-full h-full object-contain pixel-art shadow-2xl bg-black"
        />

        {/* =========================================================================
            ACTIVE HUD OVERLAY (Only visible during PLAYING / PAUSED)
            Low occlusion (<15%), pointer-events: none on wrapper
            ========================================================================= */}
        {(gameStatus === 'PLAYING' || gameStatus === 'PAUSED') && (
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 md:p-5">
            {/* TOP BAR: Campus Clock, Zone Objective, Score, Lives, ID Status, Audio/Pause */}
            <div className="flex items-start justify-between gap-3">
              {/* Campus Clock & Countdown */}
              <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-xs">
                <Clock className={`w-4 h-4 ${stats.timeRemaining <= 15 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`} />
                <div className="flex flex-col">
                  <span className="text-[10px] tracking-wider text-slate-400 font-pixel">CAMPUS CLOCK</span>
                  <span className={`text-sm md:text-base font-pixel tabular-nums ${stats.timeRemaining <= 15 ? 'text-rose-400 animate-pulse' : 'text-amber-300'}`}>
                    {formatCampusClock(stats.timeRemaining, stats.totalTime)}
                  </span>
                </div>
                <div className="pl-2 border-l border-slate-700 text-xs font-mono tabular-nums text-slate-300">
                  {stats.timeRemaining.toFixed(1)}s left
                </div>
              </div>

              {/* Current Zone & Objective Banner */}
              <div className="hidden sm:flex flex-col items-center bg-slate-900/85 border border-slate-700/60 px-4 py-1.5 rounded-lg max-w-md text-center">
                <span className="text-[10px] font-pixel text-sky-400 uppercase tracking-widest">{stats.currentZone}</span>
                <span className="text-xs text-slate-200 truncate">{stats.currentObjective}</span>
              </div>

              {/* Status Cluster: Score, Lives, ID Card, Buttons */}
              <div className="pointer-events-auto flex items-center gap-2 md:gap-3">
                {/* ID Card Status */}
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-pixel border ${stats.hasIdCard ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300' : 'bg-rose-950/80 border-rose-500/60 text-rose-300 animate-pulse'}`}>
                  <span>ID:</span>
                  <span>{stats.hasIdCard ? 'SECURED ✓' : 'MISSING ✗'}</span>
                </div>

                {/* Lives / Hearts */}
                <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 px-2.5 py-1.5 rounded-lg">
                  {[...Array(3)].map((_, i) => (
                    <Heart
                      key={i}
                      className={`w-4 h-4 ${i < stats.lives ? 'text-rose-500 fill-rose-500' : 'text-slate-600'}`}
                    />
                  ))}
                </div>

                {/* Score */}
                <div className="bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-lg flex flex-col items-end">
                  <span className="text-[9px] font-pixel text-slate-400">SCORE</span>
                  <span className="text-xs md:text-sm font-pixel text-amber-400 tabular-nums">{stats.score}</span>
                </div>

                {/* Sound Toggle */}
                <button
                  onClick={handleToggleSound}
                  className="p-2 bg-slate-900/90 border border-slate-700/80 hover:bg-slate-800 text-slate-300 rounded-lg cursor-pointer transition-colors"
                  title="Toggle Sound (M)"
                  aria-label="Toggle Sound"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                </button>

                {/* Pause Button */}
                <button
                  onClick={() => gameStatus === 'PLAYING' ? engineRef.current?.pause() : engineRef.current?.resume()}
                  className="p-2 bg-slate-900/90 border border-slate-700/80 hover:bg-slate-800 text-slate-300 rounded-lg cursor-pointer transition-colors"
                  title="Pause (Esc)"
                  aria-label="Pause"
                >
                  <Pause className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Dynamic Toast Message Banner (Warden alerts, funny item text) */}
            {toastMessage && (
              <div className="self-center bg-slate-950/95 border-2 border-amber-500/80 text-amber-200 px-4 py-2 rounded-lg shadow-2xl max-w-lg text-center animate-bounce text-xs md:text-sm font-pixel">
                {toastMessage}
              </div>
            )}

            {/* BOTTOM BAR: Progress Track to Lecture Hall 101 */}
            <div className="flex flex-col gap-1 w-full max-w-xl self-center bg-slate-950/80 border border-slate-800/80 px-3 py-2 rounded-xl backdrop-blur-xs">
              <div className="flex justify-between text-[10px] font-pixel text-slate-400">
                <span>BEDROOM</span>
                <span>CORRIDOR</span>
                <span>COURTYARD</span>
                <span className="text-amber-400">HALL 101</span>
              </div>
              <div className="relative w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-sky-400 to-emerald-400 transition-all duration-150"
                  style={{ width: `${stats.distanceCovered}%` }}
                />
              </div>
            </div>

            {/* Virtual On-Screen Mobile Touch Controls (shown on touch devices) */}
            <div className="pointer-events-auto md:hidden flex justify-between items-end pb-2">
              <div className="flex gap-2">
                <button
                  onTouchStart={handleTouchStart('left')}
                  onTouchEnd={handleTouchEnd('left')}
                  onMouseDown={handleTouchStart('left')}
                  onMouseUp={handleTouchEnd('left')}
                  className="w-14 h-14 bg-slate-900/80 border-2 border-slate-600 rounded-xl flex items-center justify-center text-white active:bg-amber-600 font-pixel text-sm"
                >
                  ◀
                </button>
                <button
                  onTouchStart={handleTouchStart('right')}
                  onTouchEnd={handleTouchEnd('right')}
                  onMouseDown={handleTouchStart('right')}
                  onMouseUp={handleTouchEnd('right')}
                  className="w-14 h-14 bg-slate-900/80 border-2 border-slate-600 rounded-xl flex items-center justify-center text-white active:bg-amber-600 font-pixel text-sm"
                >
                  ▶
                </button>
              </div>

              <button
                onTouchStart={handleTouchStart('jump')}
                onTouchEnd={handleTouchEnd('jump')}
                onMouseDown={handleTouchStart('jump')}
                onMouseUp={handleTouchEnd('jump')}
                className="w-16 h-16 bg-amber-600/90 border-2 border-amber-400 rounded-2xl flex items-center justify-center text-white active:bg-amber-500 font-pixel text-xs shadow-lg"
              >
                JUMP
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            COUNTDOWN OVERLAY (3.. 2.. 1.. GO!)
            ========================================================================= */}
        {gameStatus === 'COUNTDOWN' && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-6xl md:text-8xl font-pixel text-amber-400 animate-pulse drop-shadow-lg">
              GET READY!
            </span>
            <p className="mt-4 text-sm md:text-base font-pixel text-slate-300">
              ALARM RINGS! DASH TO CLASS!
            </p>
          </div>
        )}

        {/* =========================================================================
            TITLE SCREEN (Full Game Shell Centerpiece)
            ========================================================================= */}
        {gameStatus === 'TITLE' && (
          <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-between p-6 md:p-8 text-center backdrop-blur-xs">
            {/* Top Bar actions */}
            <div className="w-full max-w-4xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-pixel text-amber-400">
                <span>B.TECH CSE PROJECT</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">2026 EDITION</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSubmissionKit(true)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-medium text-slate-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5 text-amber-400" />
                  Assignment Files & Guide
                </button>
                <button
                  onClick={handleToggleSound}
                  className="p-2 bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 rounded-lg cursor-pointer transition-colors"
                  title="Toggle Sound (M)"
                  aria-label="Toggle Sound"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                </button>
              </div>
            </div>

            {/* Center Lockup: Title, Subtitle, Start Button */}
            <div className="flex flex-col items-center max-w-2xl my-auto">
              {/* Bespoke Pixel Title Lockup */}
              <div className="relative mb-3">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-pixel text-amber-400 tracking-tight drop-shadow-[0_4px_12px_rgba(245,158,11,0.5)]">
                  HOSTEL DASH
                </h1>
                <div className="text-xs md:text-sm font-pixel text-rose-400 mt-2 tracking-widest uppercase">
                  THE 8 AM NIGHTMARE
                </div>
              </div>

              {/* Subtitle */}
              <p className="text-sm md:text-base text-slate-300 max-w-md my-4 font-normal">
                Your lecture starts in five minutes. Your life is already falling apart.
              </p>

              {/* Core Objectives pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 mb-6 text-xs text-slate-400">
                <span className="bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded">Grab ID Card in Room</span>
                <span>·</span>
                <span className="bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded">Evade Warden Verma</span>
                <span>·</span>
                <span className="bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded">Reach Hall 101 by 8 AM</span>
              </div>

              {/* Primary Start CTA */}
              <button
                onClick={handleStartGame}
                className="group px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-pixel text-sm md:text-base rounded-xl shadow-xl shadow-amber-500/25 flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                START DASH
              </button>

              <span className="mt-3 text-xs text-slate-400">Press <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono">SPACE</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono">ENTER</kbd></span>
            </div>

            {/* Flat control-hint line */}
            <div className="w-full max-w-xl bg-slate-900/70 border border-slate-800/80 px-4 py-2 rounded-lg text-xs text-slate-400 flex items-center justify-center gap-3 md:gap-5 flex-wrap">
              <span><strong className="text-slate-200">A / D</strong> or <strong className="text-slate-200">← / →</strong> Move</span>
              <span>·</span>
              <span><strong className="text-slate-200">Space / W</strong> Jump</span>
              <span>·</span>
              <span><strong className="text-slate-200">Esc</strong> Pause</span>
              <span>·</span>
              <span><strong className="text-slate-200">M</strong> Mute</span>
            </div>
          </div>
        )}

        {/* =========================================================================
            PAUSE MODAL
            ========================================================================= */}
        {gameStatus === 'PAUSED' && (
          <div className="absolute inset-0 bg-slate-950/85 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl flex flex-col items-center">
              <span className="text-xs font-pixel text-amber-400 tracking-widest uppercase">GAME PAUSED</span>
              <h2 className="text-2xl font-pixel text-slate-100 mt-2 mb-6">TAKE A BREATH</h2>

              <div className="w-full flex flex-col gap-2.5">
                <button
                  onClick={handleResume}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs rounded-lg transition-colors cursor-pointer"
                >
                  RESUME DASH
                </button>
                <button
                  onClick={handleRestart}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-pixel text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  RESTART LEVEL
                </button>
                <button
                  onClick={handleToggleSound}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-pixel text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                  {isMuted ? 'UNMUTE AUDIO' : 'MUTE AUDIO'}
                </button>
                <button
                  onClick={handleBackToTitle}
                  className="w-full py-2 text-slate-400 hover:text-slate-200 text-xs transition-colors cursor-pointer"
                >
                  Back to Title
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            VICTORY SCREEN
            ========================================================================= */}
        {gameStatus === 'VICTORY' && (
          <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-slate-900 border-2 border-emerald-500/80 p-6 md:p-8 rounded-2xl max-w-lg w-full text-center shadow-2xl flex flex-col items-center">
              <div className="flex items-center gap-2 text-emerald-400 font-pixel text-xs">
                <Award className="w-4 h-4" />
                <span>ATTENDANCE SECURED: 100%</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-pixel text-emerald-400 mt-2 mb-2">
                YOU MADE IT!
              </h2>

              <p className="text-xs md:text-sm text-slate-300 italic mb-5">
                "{getVictoryMessage()}"
              </p>

              {/* Rank & Stats Card */}
              <div className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-pixel text-slate-400">PERFORMANCE RANK</span>
                  <span className={`px-3 py-1 rounded-md font-pixel text-sm border ${getRankBadgeColor(stats.rank)}`}>
                    {stats.rank} RANK
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 text-left">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-pixel">FINAL SCORE</span>
                    <span className="text-lg font-pixel text-amber-400 tabular-nums">{stats.score}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-pixel">TIME REMAINING</span>
                    <span className="text-lg font-pixel text-sky-400 tabular-nums">{stats.timeRemaining.toFixed(1)}s</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-pixel">LIVES REMAINING</span>
                    <span className="text-sm font-pixel text-rose-400">{stats.lives} / 3 HEARTS</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-pixel">COLLECTIBLES</span>
                    <span className="text-sm font-pixel text-emerald-400">
                      {stats.collectiblesCount.assignments + stats.collectiblesCount.coffee + stats.collectiblesCount.coupons} ITEMS
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="w-full flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleRestart}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-pixel text-xs rounded-xl transition-all cursor-pointer shadow-lg"
                >
                  PLAY AGAIN (SPACE)
                </button>
                <button
                  onClick={handleBackToTitle}
                  className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-pixel text-xs rounded-xl transition-colors cursor-pointer"
                >
                  MAIN MENU
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            GAME OVER SCREEN
            ========================================================================= */}
        {gameStatus === 'GAMEOVER' && (
          <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-slate-900 border-2 border-rose-500/80 p-6 md:p-8 rounded-2xl max-w-lg w-full text-center shadow-2xl flex flex-col items-center">
              <span className="text-xs font-pixel text-rose-500 tracking-widest uppercase">DEFEAT</span>

              <h2 className="text-3xl md:text-4xl font-pixel text-rose-500 mt-2 mb-2">
                ATTENDANCE: 0%
              </h2>

              <p className="text-xs md:text-sm text-slate-300 italic mb-5">
                {stats.gameoverReason || '8:00 AM has arrived. Professor Sharma has locked the classroom door.'}
              </p>

              {/* Summary Stats */}
              <div className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-pixel">DISTANCE COVERED</span>
                    <span className="text-base font-pixel text-amber-400 tabular-nums">{stats.distanceCovered}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-pixel">SCORE EARNED</span>
                    <span className="text-base font-pixel text-sky-400 tabular-nums">{stats.score}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-pixel">ID CARD STATUS</span>
                    <span className="text-xs font-pixel text-slate-200">{stats.hasIdCard ? 'Secured' : 'Forgotten in room'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-pixel">DEFEATED AT</span>
                    <span className="text-xs font-pixel text-rose-400">{stats.currentZone}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="w-full flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleRestart}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs rounded-xl transition-all cursor-pointer shadow-lg"
                >
                  TRY AGAIN (SPACE)
                </button>
                <button
                  onClick={handleBackToTitle}
                  className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-pixel text-xs rounded-xl transition-colors cursor-pointer"
                >
                  MAIN MENU
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          COLLEGE ASSIGNMENT SUBMISSION KIT MODAL
          Gives the student all details, code files, and GitHub upload commands!
          ========================================================================= */}
      {showSubmissionKit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-pixel text-amber-400">STUDENT ASSIGNMENT PORTAL</span>
                <h3 className="text-lg font-bold text-white mt-1">Hostel Dash: Project Submission Kit</h3>
              </div>
              <button
                onClick={() => setShowSubmissionKit(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5 py-4 text-xs md:text-sm">
              <div>
                <h4 className="font-semibold text-white mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  College Assignment Requirements Checklist
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
                  <li><strong>Core Concept:</strong> Sleepy student wakes at 7:55 AM, races to 8:00 AM lecture before door locks.</li>
                  <li><strong>Pure Canvas 2D:</strong> No external sprites or remote images, 100% procedural pixel-art.</li>
                  <li><strong>Self-Contained Audio:</strong> Pure Web Audio API synthesis (zero external mp3/wav files).</li>
                  <li><strong>3 Level Sections:</strong> Hostel Bedroom → Corridor & Courtyard → Academic Block & Room 101.</li>
                  <li><strong>Mandatory Collectible:</strong> Student ID Card in bedroom (mandatory for classroom admission).</li>
                  <li><strong>Hazards:</strong> Patrolling Warden Verma, rolling football, water puddles, book stacks, shoes.</li>
                  <li><strong>Physics:</strong> Delta-time game loop, variable jump height, coyote time & jump buffering.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2 flex items-center gap-1.5">
                  <Github className="w-4 h-4 text-sky-400" />
                  How to Upload to GitHub & Host on GitHub Pages
                </h4>
                <div className="bg-slate-950 p-3 rounded-lg font-mono text-xs text-amber-300 space-y-1 overflow-x-auto">
                  <p># 1. Initialize git and commit your files</p>
                  <p>git init</p>
                  <p>git add .</p>
                  <p>git commit -m "feat: complete playable 2D platformer - Hostel Dash"</p>
                  <p># 2. Add your GitHub repository link</p>
                  <p>git branch -M main</p>
                  <p>git remote add origin https://github.com/YOUR_USERNAME/hostel-dash.git</p>
                  <p>git push -u origin main</p>
                </div>
                <p className="text-slate-400 mt-2 text-xs">
                  To enable GitHub Pages: Go to your repository <strong>Settings → Pages → Source: Deploy from branch (main / root) → Save</strong>. Your game will be live for your professor in seconds!
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-1 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-amber-400" />
                  Standalone Files Included in Repository
                </h4>
                <p className="text-slate-300 mb-2">
                  This project includes ready-to-run files in <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300">/public/standalone.html</code> and <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300">/README.md</code> that can be double-clicked in any browser without needing Node.js or npm!
                </p>
                <a
                  href="/standalone.html"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                  Open Standalone HTML Version
                </a>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowSubmissionKit(false)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs rounded-lg cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
