import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Bot, 
  RotateCcw, 
  Trophy, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Swords, 
  User, 
  Zap,
  CheckCircle2
} from 'lucide-react';
import { FluentTicTacToeIcon } from '../../components/FluentIcons';

type Player = 'X' | 'O';
type Board = (Player | null)[];

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

interface TicTacToeProps {
  navigate?: (route: string) => void;
}

export const TicTacToe: React.FC<TicTacToeProps> = ({ navigate }) => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [gameMode, setGameMode] = useState<'pve' | 'pvp'>('pve'); // 'pve' = vs bot, 'pvp' = 2 players
  const [botDifficulty, setBotDifficulty] = useState<'easy' | 'medium' | 'hard'>('hard');
  const [scores, setScores] = useState<{ x: number; o: number; ties: number }>({ x: 0, o: 0, ties: 0 });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Audio effects synthesizer
  const playMoveSound = (player: Player) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = player === 'X' ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(player === 'X' ? 440 : 330, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  };

  const playGameOverSound = (isWin: boolean) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;
      if (isWin) {
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          gain.gain.setValueAtTime(0.25, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.3);
        });
      }
    } catch {}
  };

  // Check winner
  const checkWinner = (currentBoard: Board): { winner: Player | null; line: number[] | null } => {
    for (const line of WINNING_COMBINATIONS) {
      const [a, b, c] = line;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { winner: currentBoard[a], line };
      }
    }
    return { winner: null, line: null };
  };

  const { winner, line: winningLine } = checkWinner(board);
  const isDraw = !winner && board.every((cell) => cell !== null);
  const isGameOver = Boolean(winner || isDraw);

  // Minimax Algorithm for unbeatable Bot
  const minimax = (currentBoard: Board, depth: number, isMaximizing: boolean): number => {
    const res = checkWinner(currentBoard);
    if (res.winner === 'O') return 10 - depth; // Bot is O
    if (res.winner === 'X') return depth - 10; // Human is X
    if (currentBoard.every((cell) => cell !== null)) return 0; // Draw

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === null) {
          currentBoard[i] = 'O';
          const score = minimax(currentBoard, depth + 1, false);
          currentBoard[i] = null;
          maxScore = Math.max(score, maxScore);
        }
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === null) {
          currentBoard[i] = 'X';
          const score = minimax(currentBoard, depth + 1, true);
          currentBoard[i] = null;
          minScore = Math.min(score, minScore);
        }
      }
      return minScore;
    }
  };

  // Bot move calculator
  const calculateBotMove = useCallback((currentBoard: Board): number => {
    const available = currentBoard
      .map((val, idx) => (val === null ? idx : null))
      .filter((val): val is number => val !== null);

    if (available.length === 0) return -1;

    // Easy: Pure random
    if (botDifficulty === 'easy') {
      return available[Math.floor(Math.random() * available.length)];
    }

    // Medium: 50% minimax, 50% random
    if (botDifficulty === 'medium') {
      if (Math.random() < 0.45) {
        return available[Math.floor(Math.random() * available.length)];
      }
    }

    // Hard / Minimax (Unbeatable)
    let bestScore = -Infinity;
    let bestMove = available[0];

    for (const move of available) {
      currentBoard[move] = 'O';
      const score = minimax(currentBoard, 0, false);
      currentBoard[move] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }, [botDifficulty]);

  // Handle cell click
  const handleCellClick = (index: number) => {
    if (board[index] || isGameOver) return;
    if (gameMode === 'pve' && !isXNext) return; // Prevent clicking during bot turn

    const newBoard = [...board];
    const currentPlayer: Player = isXNext ? 'X' : 'O';
    newBoard[index] = currentPlayer;
    playMoveSound(currentPlayer);
    setBoard(newBoard);
    setIsXNext(!isXNext);

    const winCheck = checkWinner(newBoard);
    if (winCheck.winner) {
      playGameOverSound(true);
      setScores((prev) => ({
        ...prev,
        [winCheck.winner === 'X' ? 'x' : 'o']: prev[winCheck.winner === 'X' ? 'x' : 'o'] + 1
      }));
    } else if (newBoard.every((c) => c !== null)) {
      playGameOverSound(false);
      setScores((prev) => ({ ...prev, ties: prev.ties + 1 }));
    }
  };

  // Trigger bot move
  useEffect(() => {
    if (gameMode === 'pve' && !isXNext && !isGameOver) {
      const timer = setTimeout(() => {
        const botMoveIndex = calculateBotMove(board);
        if (botMoveIndex !== -1 && board[botMoveIndex] === null) {
          const newBoard = [...board];
          newBoard[botMoveIndex] = 'O';
          playMoveSound('O');
          setBoard(newBoard);
          setIsXNext(true);

          const winCheck = checkWinner(newBoard);
          if (winCheck.winner) {
            playGameOverSound(true);
            setScores((prev) => ({ ...prev, o: prev.o + 1 }));
          } else if (newBoard.every((c) => c !== null)) {
            playGameOverSound(false);
            setScores((prev) => ({ ...prev, ties: prev.ties + 1 }));
          }
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isXNext, gameMode, board, isGameOver, calculateBotMove]);

  // Reset current round
  const resetRound = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  };

  // Reset entire score
  const resetScores = () => {
    setScores({ x: 0, o: 0, ties: 0 });
    resetRound();
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex flex-col bg-[#f9f9f9] dark:bg-[#1a1c20] text-black dark:text-white select-none">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#22252a] border-b border-black/10 dark:border-white/10 px-4 sm:px-6 py-4 shrink-0 shadow-xs">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <FluentTicTacToeIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  Tic-Tac-Toe
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-[#0078d4]/15 text-[#0078d4] dark:text-[#4cc2ff] text-[10px] font-bold uppercase tracking-wider">
                  Cờ Caro 3x3
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Chơi 2 người trên cùng thiết bị hoặc thi đấu thông minh với AI Bot.
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
              onClick={resetRound}
              className="px-3.5 py-1.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Ván Mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col items-center justify-center gap-6">
        {/* Mode Selector Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 gap-1">
          <button
            type="button"
            onClick={() => {
              setGameMode('pve');
              resetRound();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              gameMode === 'pve'
                ? 'bg-white dark:bg-[#2d3139] text-[#0078d4] dark:text-[#4cc2ff] shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Đấu Với Bot (1 Người)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setGameMode('pvp');
              resetRound();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              gameMode === 'pvp'
                ? 'bg-white dark:bg-[#2d3139] text-[#0078d4] dark:text-[#4cc2ff] shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>2 Người Chơi (Pass & Play)</span>
          </button>
        </div>

        {/* Bot Difficulty Selector when PvE */}
        {gameMode === 'pve' && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-500 font-medium">Độ khó Bot:</span>
            {(['easy', 'medium', 'hard'] as const).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => {
                  setBotDifficulty(diff);
                  resetRound();
                }}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  botDifficulty === diff
                    ? 'bg-[#0078d4] dark:bg-[#4cc2ff] text-white dark:text-black'
                    : 'bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-300 hover:bg-black/10'
                }`}
              >
                {diff === 'easy' ? 'Dễ' : diff === 'medium' ? 'Vừa' : 'Bất Khả Chiến Bại'}
              </button>
            ))}
          </div>
        )}

        {/* Score Board */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-sm text-center">
          <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20">
            <div className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase">
              {gameMode === 'pve' ? 'Bạn (X)' : 'Người chơi X'}
            </div>
            <div className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-0.5">
              {scores.x}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
            <div className="text-[11px] font-bold text-neutral-500 uppercase">Hòa</div>
            <div className="text-2xl font-black text-neutral-600 dark:text-neutral-300 mt-0.5">
              {scores.ties}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase">
              {gameMode === 'pve' ? 'Bot AI (O)' : 'Người chơi O'}
            </div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
              {scores.o}
            </div>
          </div>
        </div>

        {/* Turn / Winner Status Banner */}
        <div className="text-sm font-semibold flex items-center gap-2">
          {winner ? (
            <span className="text-emerald-500 dark:text-emerald-400 flex items-center gap-1.5 font-bold text-base animate-pulse">
              <Trophy className="w-5 h-5 text-amber-400" />
              Chiến thắng: Người chơi {winner}!
            </span>
          ) : isDraw ? (
            <span className="text-amber-500 font-bold text-base">
              Ván cờ hòa!
            </span>
          ) : (
            <span className="text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
              <span>Đang đến lượt:</span>
              <span className={`px-2.5 py-0.5 rounded-full font-black text-xs ${
                isXNext 
                  ? 'bg-sky-500/20 text-sky-600 dark:text-sky-400' 
                  : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
              }`}>
                {isXNext ? 'X' : 'O'} {gameMode === 'pve' && !isXNext ? '(Bot suy nghĩ...)' : ''}
              </span>
            </span>
          )}
        </div>

        {/* 3x3 Game Board Grid */}
        <div className="p-3 rounded-2xl bg-white dark:bg-[#25282e] border border-black/10 dark:border-white/10 shadow-lg">
          <div className="grid grid-cols-3 gap-2.5 w-[280px] h-[280px] sm:w-[330px] sm:h-[330px]">
            {board.map((cell, index) => {
              const isWinningCell = winningLine?.includes(index);
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleCellClick(index)}
                  disabled={Boolean(cell || isGameOver)}
                  className={`relative rounded-xl font-black text-4xl sm:text-5xl flex items-center justify-center transition-all cursor-pointer ${
                    isWinningCell
                      ? 'bg-emerald-500 text-white shadow-md scale-95'
                      : cell
                        ? 'bg-black/5 dark:bg-white/5 cursor-default'
                        : 'bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/10 dark:hover:bg-white/10 active:scale-95'
                  }`}
                >
                  {cell === 'X' && (
                    <span className={isWinningCell ? 'text-white' : 'text-[#0078d4] dark:text-[#4cc2ff]'}>
                      X
                    </span>
                  )}
                  {cell === 'O' && (
                    <span className={isWinningCell ? 'text-white' : 'text-rose-500 dark:text-rose-400'}>
                      O
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Reset Scores Option */}
        <button
          type="button"
          onClick={resetScores}
          className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 underline cursor-pointer"
        >
          Đặt lại toàn bộ bảng điểm
        </button>
      </div>
    </div>
  );
};
