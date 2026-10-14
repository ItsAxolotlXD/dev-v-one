import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Bot, 
  RotateCcw, 
  Trophy, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Swords, 
  Shield, 
  Flame,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { FluentRpsIcon } from '../../components/FluentIcons';

type Choice = 'rock' | 'paper' | 'scissors';

interface ChoiceMeta {
  id: Choice;
  label: string;
  emoji: string;
  beats: Choice;
  beatenBy: Choice;
  color: string;
}

const CHOICES: Record<Choice, ChoiceMeta> = {
  rock: {
    id: 'rock',
    label: 'Búa',
    emoji: '✊',
    beats: 'scissors',
    beatenBy: 'paper',
    color: 'from-amber-500 to-red-600'
  },
  scissors: {
    id: 'scissors',
    label: 'Kéo',
    emoji: '✌️',
    beats: 'paper',
    beatenBy: 'rock',
    color: 'from-sky-500 to-blue-600'
  },
  paper: {
    id: 'paper',
    label: 'Bao',
    emoji: '✋',
    beats: 'rock',
    beatenBy: 'scissors',
    color: 'from-emerald-500 to-teal-600'
  }
};

interface RockPaperScissorsProps {
  navigate?: (route: string) => void;
}

export const RockPaperScissors: React.FC<RockPaperScissorsProps> = ({ navigate }) => {
  const [gameMode, setGameMode] = useState<'pve' | 'pvp'>('pve'); // 'pve' = vs bot, 'pvp' = 2 players
  const [soundEnabled, setSoundEnabled] = useState(true);

  // PvE state
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [botChoice, setBotChoice] = useState<Choice | null>(null);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownText, setCountdownText] = useState('3');

  // PvP state (Pass & Play)
  const [p1Choice, setP1Choice] = useState<Choice | null>(null);
  const [p2Choice, setP2Choice] = useState<Choice | null>(null);
  const [pvpTurn, setPvpTurn] = useState<'p1' | 'p2' | 'revealed'>('p1');

  // Outcome & Score
  const [roundResult, setRoundResult] = useState<'win' | 'lose' | 'tie' | null>(null);
  const [resultMessage, setResultMessage] = useState<string>('');
  const [scores, setScores] = useState({ p1: 0, p2: 0, ties: 0 });
  const [streak, setStreak] = useState(0);
  const [history, setHistory] = useState<Array<{ p1: Choice; p2: Choice; result: string }>>([]);

  // Synthesize sound
  const playSound = (type: 'move' | 'win' | 'lose' | 'tie') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'move') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.08);
      } else if (type === 'win') {
        [523.25, 659.25, 783.99].forEach((f, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'triangle';
          o.frequency.setValueAtTime(f, now + idx * 0.1);
          g.gain.setValueAtTime(0.3, now + idx * 0.1);
          g.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.25);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(now + idx * 0.1);
          o.stop(now + idx * 0.1 + 0.25);
        });
      } else if (type === 'lose') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.2);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.2);
      } else if (type === 'tie') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(350, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.15);
      }
    } catch {}
  };

  // Evaluate winner between two choices
  const evaluateChoices = (c1: Choice, c2: Choice) => {
    if (c1 === c2) {
      setRoundResult('tie');
      setResultMessage('Hòa nhau! Cả hai cùng ra ' + CHOICES[c1].label);
      setScores((s) => ({ ...s, ties: s.ties + 1 }));
      setStreak(0);
      playSound('tie');
      setHistory((h) => [{ p1: c1, p2: c2, result: 'Hòa' }, ...h.slice(0, 9)]);
    } else if (CHOICES[c1].beats === c2) {
      setRoundResult('win');
      const winText = `${CHOICES[c1].label} thắng ${CHOICES[c2].label}!`;
      setResultMessage(gameMode === 'pve' ? `Bạn thắng! ${winText}` : `Người chơi 1 thắng! ${winText}`);
      setScores((s) => ({ ...s, p1: s.p1 + 1 }));
      setStreak((st) => st + 1);
      playSound('win');
      setHistory((h) => [{ p1: c1, p2: c2, result: 'P1 Thắng' }, ...h.slice(0, 9)]);
    } else {
      setRoundResult('lose');
      const loseText = `${CHOICES[c2].label} thắng ${CHOICES[c1].label}!`;
      setResultMessage(gameMode === 'pve' ? `Bot thắng! ${loseText}` : `Người chơi 2 thắng! ${loseText}`);
      setScores((s) => ({ ...s, p2: s.p2 + 1 }));
      setStreak(0);
      playSound('lose');
      setHistory((h) => [{ p1: c1, p2: c2, result: gameMode === 'pve' ? 'Bot Thắng' : 'P2 Thắng' }, ...h.slice(0, 9)]);
    }
  };

  // Play vs Bot
  const handlePveSelect = (choice: Choice) => {
    if (isCountingDown) return;
    playSound('move');
    setIsCountingDown(true);
    setPlayerChoice(choice);
    setBotChoice(null);
    setRoundResult(null);

    // Dramatic countdown: 3... 2... 1... Ra!
    setCountdownText('3');
    setTimeout(() => {
      setCountdownText('2');
      playSound('move');
      setTimeout(() => {
        setCountdownText('1');
        playSound('move');
        setTimeout(() => {
          setCountdownText('RA!');
          // Bot pick
          const choiceKeys: Choice[] = ['rock', 'paper', 'scissors'];
          const randomBotChoice = choiceKeys[Math.floor(Math.random() * choiceKeys.length)];
          setBotChoice(randomBotChoice);
          setIsCountingDown(false);
          evaluateChoices(choice, randomBotChoice);
        }, 350);
      }, 350);
    }, 350);
  };

  // Play 2 Players (Pass & Play)
  const handlePvpSelect = (choice: Choice) => {
    playSound('move');
    if (pvpTurn === 'p1') {
      setP1Choice(choice);
      setPvpTurn('p2');
    } else if (pvpTurn === 'p2') {
      setP2Choice(choice);
      setPvpTurn('revealed');
      if (p1Choice) {
        evaluateChoices(p1Choice, choice);
      }
    }
  };

  const resetGame = () => {
    setPlayerChoice(null);
    setBotChoice(null);
    setP1Choice(null);
    setP2Choice(null);
    setPvpTurn('p1');
    setRoundResult(null);
    setResultMessage('');
  };

  const resetScoreboard = () => {
    setScores({ p1: 0, p2: 0, ties: 0 });
    setStreak(0);
    setHistory([]);
    resetGame();
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex flex-col bg-[#f9f9f9] dark:bg-[#1a1c20] text-black dark:text-white select-none">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#22252a] border-b border-black/10 dark:border-white/10 px-4 sm:px-6 py-4 shrink-0 shadow-xs">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md">
              <FluentRpsIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  Kéo Búa Bao
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10px] font-bold uppercase tracking-wider">
                  Rock Paper Scissors
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Quyết định mọi sự lựa chọn với trò chơi dân gian kinh điển (Đấu với Bot hoặc 2 Người).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              className="p-2 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-500" />}
            </button>
            <button
              type="button"
              onClick={resetGame}
              className="px-3.5 py-1.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Ván Mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col items-center justify-center gap-6">
        {/* Mode Selector */}
        <div className="flex items-center p-1 rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 gap-1">
          <button
            type="button"
            onClick={() => {
              setGameMode('pve');
              resetGame();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              gameMode === 'pve'
                ? 'bg-white dark:bg-[#2d3139] text-[#0078d4] dark:text-[#4cc2ff] shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Đấu Với Bot</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setGameMode('pvp');
              resetGame();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              gameMode === 'pvp'
                ? 'bg-white dark:bg-[#2d3139] text-[#0078d4] dark:text-[#4cc2ff] shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>2 Người Chơi (Bí Mật)</span>
          </button>
        </div>

        {/* Score Board */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-md text-center">
          <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/20">
            <div className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase">
              {gameMode === 'pve' ? 'Bạn' : 'Người chơi 1'}
            </div>
            <div className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-0.5">
              {scores.p1}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex flex-col items-center justify-center">
            <div className="text-[11px] font-bold text-neutral-500 uppercase">Hòa</div>
            <div className="text-2xl font-black text-neutral-600 dark:text-neutral-300 mt-0.5">
              {scores.ties}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase">
              {gameMode === 'pve' ? 'Bot' : 'Người chơi 2'}
            </div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
              {scores.p2}
            </div>
          </div>
        </div>

        {/* Streak Indicator */}
        {streak > 1 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold animate-pulse">
            <Flame className="w-4 h-4 fill-current" />
            <span>Chuỗi thắng: {streak} ván liên tiếp!</span>
          </div>
        )}

        {/* Arena Stage */}
        <div className="w-full max-w-xl p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#25282e] border border-black/10 dark:border-white/10 shadow-lg flex flex-col items-center gap-6">
          {/* Duel Display */}
          <div className="flex items-center justify-around w-full">
            {/* Player 1 Hand */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500">
                {gameMode === 'pve' ? 'Bạn' : 'Người chơi 1'}
              </span>
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center text-5xl sm:text-6xl shadow-inner transition-transform">
                {gameMode === 'pve' ? (
                  playerChoice ? CHOICES[playerChoice].emoji : '❓'
                ) : pvpTurn === 'p1' ? (
                  '❓'
                ) : pvpTurn === 'p2' ? (
                  '🔒'
                ) : p1Choice ? (
                  CHOICES[p1Choice].emoji
                ) : (
                  '❓'
                )}
              </div>
              <span className="text-xs font-bold">
                {gameMode === 'pve' && playerChoice ? CHOICES[playerChoice].label : ''}
                {gameMode === 'pvp' && pvpTurn === 'revealed' && p1Choice ? CHOICES[p1Choice].label : ''}
              </span>
            </div>

            {/* VS Emblem / Countdown */}
            <div className="flex flex-col items-center justify-center">
              {isCountingDown ? (
                <div className="w-16 h-16 rounded-full bg-[#0078d4] text-white flex items-center justify-center font-black text-2xl animate-ping">
                  {countdownText}
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center font-black text-sm text-neutral-400">
                  VS
                </div>
              )}
            </div>

            {/* Player 2 / Bot Hand */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500">
                {gameMode === 'pve' ? 'Bot' : 'Người chơi 2'}
              </span>
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center text-5xl sm:text-6xl shadow-inner transition-transform">
                {gameMode === 'pve' ? (
                  isCountingDown ? (
                    '🤖'
                  ) : botChoice ? (
                    CHOICES[botChoice].emoji
                  ) : (
                    '❓'
                  )
                ) : pvpTurn === 'revealed' && p2Choice ? (
                  CHOICES[p2Choice].emoji
                ) : pvpTurn === 'p2' ? (
                  '❓'
                ) : (
                  '⏳'
                )}
              </div>
              <span className="text-xs font-bold">
                {gameMode === 'pve' && botChoice ? CHOICES[botChoice].label : ''}
                {gameMode === 'pvp' && pvpTurn === 'revealed' && p2Choice ? CHOICES[p2Choice].label : ''}
              </span>
            </div>
          </div>

          {/* Result Text */}
          {resultMessage && (
            <div className={`w-full p-3 rounded-xl text-center font-bold text-sm sm:text-base animate-fade-in ${
              roundResult === 'win' 
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : roundResult === 'lose'
                  ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
            }`}>
              {resultMessage}
            </div>
          )}

          {/* Interactive Selection Buttons */}
          <div className="w-full space-y-3">
            <div className="text-xs font-semibold text-center text-neutral-500">
              {gameMode === 'pve' && 'Chọn đòn xuất chiêu của bạn:'}
              {gameMode === 'pvp' && pvpTurn === 'p1' && 'Lượt Người chơi 1: Bí mật chọn 1 đòn'}
              {gameMode === 'pvp' && pvpTurn === 'p2' && 'Lượt Người chơi 2: Bí mật chọn 1 đòn để so tài'}
              {gameMode === 'pvp' && pvpTurn === 'revealed' && 'Kết quả đã mở! Bấm bên dưới để đấu ván tiếp'}
            </div>

            {gameMode === 'pve' || pvpTurn !== 'revealed' ? (
              <div className="grid grid-cols-3 gap-3 w-full">
                {(['rock', 'scissors', 'paper'] as const).map((key) => {
                  const item = CHOICES[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={isCountingDown}
                      onClick={() => (gameMode === 'pve' ? handlePveSelect(key) : handlePvpSelect(key))}
                      className="p-4 sm:p-5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 border border-black/10 dark:border-white/10 flex flex-col items-center gap-2 transition-all cursor-pointer group"
                    >
                      <span className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform">
                        {item.emoji}
                      </span>
                      <span className="font-bold text-xs sm:text-sm text-neutral-800 dark:text-neutral-200">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <button
                type="button"
                onClick={resetGame}
                className="w-full py-3.5 rounded-xl bg-[#0078d4] dark:bg-[#4cc2ff] text-white dark:text-black font-bold text-sm shadow-md hover:brightness-110 cursor-pointer"
              >
                Tiếp Tục Ván Sau
              </button>
            )}
          </div>
        </div>

        {/* Rules Pill */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-500">
          <span>✊ Búa đập ✌️ Kéo</span>
          <span>•</span>
          <span>✌️ Kéo cắt ✋ Bao</span>
          <span>•</span>
          <span>✋ Bao bọc ✊ Búa</span>
        </div>

        {/* Reset scoreboard */}
        <button
          type="button"
          onClick={resetScoreboard}
          className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 underline cursor-pointer"
        >
          Đặt lại tỉ số và lịch sử
        </button>
      </div>
    </div>
  );
};
