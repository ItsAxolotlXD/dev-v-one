import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  History, 
  RotateCcw, 
  Trash2, 
  Equal, 
  Delete, 
  Check, 
  Copy, 
  ChevronDown, 
  Calculator as CalcIcon,
  Sparkles,
  Layers,
  ArrowRightLeft
} from 'lucide-react';
import { FluentCalculatorIcon, FluentCalculatorColorIcon } from '../components/FluentIcons';
import { keyboardSound } from '../utils/keyboardSound';
import { recordRecallActivity } from '../services/recallService';

interface CalculatorProps {
  navigate?: (route: string) => void;
}

type CalcMode = 'standard' | 'scientific' | 'converter';

interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
}

export const Calculator: React.FC<CalculatorProps> = ({ navigate }) => {
  const [mode, setMode] = useState<CalcMode>('standard');
  const [displayValue, setDisplayValue] = useState<string>('0');
  const [expression, setExpression] = useState<string>('');
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [memory, setMemory] = useState<number>(0);
  const [isMemorySet, setIsMemorySet] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [angleUnit, setAngleUnit] = useState<'deg' | 'rad'>('deg'); // For scientific

  // Converter state
  const [convertCategory, setConvertCategory] = useState<'length' | 'currency' | 'temp'>('currency');
  const [fromUnit, setFromUnit] = useState<string>('VND');
  const [toUnit, setToUnit] = useState<string>('USD');
  const [convertValue, setConvertValue] = useState<string>('100000');

  // History state with localStorage persistence
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('vone_calculator_history');
      return saved ? JSON.parse(saved) : [
        { id: '1', expression: '25 × 40', result: '1,000', timestamp: 'Hôm nay' },
        { id: '2', expression: '12,500 + 3,800', result: '16,300', timestamp: 'Hôm nay' }
      ];
    } catch {
      return [];
    }
  });

  const [copiedToast, setCopiedToast] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('vone_calculator_history', JSON.stringify(history));
    } catch {}
  }, [history]);

  const playClick = () => {
    try {
      keyboardSound.playKeyClick('char');
    } catch {}
  };

  const copyToClipboard = () => {
    try {
      navigator.clipboard.writeText(displayValue);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    } catch {}
  };

  // Calculator logic
  const inputDigit = (digit: string) => {
    playClick();
    if (waitingForOperand) {
      setDisplayValue(digit);
      setWaitingForOperand(false);
    } else {
      setDisplayValue(displayValue === '0' ? digit : displayValue + digit);
    }
  };

  const inputDecimal = () => {
    playClick();
    if (waitingForOperand) {
      setDisplayValue('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.');
    }
  };

  const clearAll = () => {
    playClick();
    setDisplayValue('0');
    setExpression('');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const clearEntry = () => {
    playClick();
    setDisplayValue('0');
  };

  const deleteLastChar = () => {
    playClick();
    if (waitingForOperand) return;
    if (displayValue.length === 1 || (displayValue.length === 2 && displayValue.startsWith('-'))) {
      setDisplayValue('0');
    } else {
      setDisplayValue(displayValue.slice(0, -1));
    }
  };

  const toggleSign = () => {
    playClick();
    const val = parseFloat(displayValue);
    if (val === 0) return;
    setDisplayValue(String(-val));
  };

  const performOperation = (nextOperator: string) => {
    playClick();
    const inputValue = parseFloat(displayValue);

    if (prevValue === null) {
      setPrevValue(inputValue);
      setExpression(`${displayValue} ${nextOperator}`);
    } else if (operator) {
      const currentValue = prevValue || 0;
      let newValue = calculate(currentValue, inputValue, operator);
      
      // format floating precision nicely
      newValue = Math.round(newValue * 100000000) / 100000000;
      setPrevValue(newValue);
      setDisplayValue(String(newValue));
      setExpression(`${newValue} ${nextOperator}`);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '−':
      case '-': return a - b;
      case '×':
      case '*': return a * b;
      case '÷':
      case '/': return b !== 0 ? a / b : 0;
      case '%': return (a * b) / 100;
      case 'x^y': return Math.pow(a, b);
      default: return b;
    }
  };

  const handleEqual = () => {
    playClick();
    const inputValue = parseFloat(displayValue);

    if (operator && prevValue !== null) {
      let result = calculate(prevValue, inputValue, operator);
      result = Math.round(result * 100000000) / 100000000;
      const fullExpr = `${prevValue} ${operator} ${displayValue}`;
      
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        expression: fullExpr,
        result: String(result),
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setHistory(prev => [newHistoryItem, ...prev.slice(0, 49)]);
      void recordRecallActivity({ type: 'calculation', title: fullExpr, source: String(result), route: '/calculator', metadata: { expression: fullExpr, result } });

      setDisplayValue(String(result));
      setExpression(`${fullExpr} =`);
      setPrevValue(null);
      setOperator(null);
      setWaitingForOperand(true);
    }
  };

  // Scientific special functions
  const handleScientificUnary = (func: string) => {
    playClick();
    const val = parseFloat(displayValue);
    let result = 0;

    switch (func) {
      case 'sqr': // x²
        result = val * val;
        setExpression(`sqr(${val})`);
        break;
      case 'sqrt': // √x
        result = val >= 0 ? Math.sqrt(val) : 0;
        setExpression(`√(${val})`);
        break;
      case 'recip': // 1/x
        result = val !== 0 ? 1 / val : 0;
        setExpression(`1/(${val})`);
        break;
      case 'sin':
        result = angleUnit === 'deg' ? Math.sin((val * Math.PI) / 180) : Math.sin(val);
        setExpression(`sin(${val})`);
        break;
      case 'cos':
        result = angleUnit === 'deg' ? Math.cos((val * Math.PI) / 180) : Math.cos(val);
        setExpression(`cos(${val})`);
        break;
      case 'tan':
        result = angleUnit === 'deg' ? Math.tan((val * Math.PI) / 180) : Math.tan(val);
        setExpression(`tan(${val})`);
        break;
      case 'ln':
        result = val > 0 ? Math.log(val) : 0;
        setExpression(`ln(${val})`);
        break;
      case 'log':
        result = val > 0 ? Math.log10(val) : 0;
        setExpression(`log(${val})`);
        break;
      case 'fact': // n!
        let f = 1;
        const n = Math.min(Math.floor(val), 30);
        for (let i = 2; i <= n; i++) f *= i;
        result = f;
        setExpression(`fact(${val})`);
        break;
      case 'pi':
        result = Math.PI;
        setExpression('π');
        break;
      case 'e':
        result = Math.E;
        setExpression('e');
        break;
      case 'abs':
        result = Math.abs(val);
        setExpression(`abs(${val})`);
        break;
      default:
        result = val;
    }

    result = Math.round(result * 100000000) / 100000000;
    setDisplayValue(String(result));
    setWaitingForOperand(true);
  };

  // Memory functions
  const handleMemory = (action: 'MC' | 'MR' | 'M+' | 'M-' | 'MS') => {
    playClick();
    const current = parseFloat(displayValue);

    switch (action) {
      case 'MC':
        setMemory(0);
        setIsMemorySet(false);
        break;
      case 'MR':
        setDisplayValue(String(memory));
        setWaitingForOperand(true);
        break;
      case 'M+':
        setMemory(prev => prev + current);
        setIsMemorySet(true);
        setWaitingForOperand(true);
        break;
      case 'M-':
        setMemory(prev => prev - current);
        setIsMemorySet(true);
        setWaitingForOperand(true);
        break;
      case 'MS':
        setMemory(current);
        setIsMemorySet(true);
        setWaitingForOperand(true);
        break;
    }
  };

  // Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in converter inputs
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      if (e.key >= '0' && e.key <= '9') {
        inputDigit(e.key);
      } else if (e.key === '.') {
        inputDecimal();
      } else if (e.key === '+') {
        performOperation('+');
      } else if (e.key === '-') {
        performOperation('−');
      } else if (e.key === '*') {
        performOperation('×');
      } else if (e.key === '/') {
        e.preventDefault();
        performOperation('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEqual();
      } else if (e.key === 'Backspace') {
        deleteLastChar();
      } else if (e.key === 'Escape') {
        clearAll();
      } else if (e.key === '%') {
        performOperation('%');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Calculate currency or units
  const calculateConversion = () => {
    const val = parseFloat(convertValue) || 0;
    if (convertCategory === 'currency') {
      // VND to USD rate approx 25,400
      if (fromUnit === 'VND' && toUnit === 'USD') return (val / 25400).toFixed(2);
      if (fromUnit === 'USD' && toUnit === 'VND') return Math.round(val * 25400).toLocaleString('vi-VN');
      if (fromUnit === 'VND' && toUnit === 'EUR') return (val / 27200).toFixed(2);
      if (fromUnit === 'EUR' && toUnit === 'VND') return Math.round(val * 27200).toLocaleString('vi-VN');
      if (fromUnit === 'USD' && toUnit === 'EUR') return (val * 0.93).toFixed(2);
      if (fromUnit === 'EUR' && toUnit === 'USD') return (val * 1.07).toFixed(2);
      return String(val);
    }
    if (convertCategory === 'length') {
      // Meters to Feet / Km / Miles
      if (fromUnit === 'm' && toUnit === 'ft') return (val * 3.28084).toFixed(3);
      if (fromUnit === 'ft' && toUnit === 'm') return (val / 3.28084).toFixed(3);
      if (fromUnit === 'km' && toUnit === 'mi') return (val * 0.621371).toFixed(3);
      if (fromUnit === 'mi' && toUnit === 'km') return (val / 0.621371).toFixed(3);
      return String(val);
    }
    if (convertCategory === 'temp') {
      if (fromUnit === '°C' && toUnit === '°F') return ((val * 9) / 5 + 32).toFixed(1);
      if (fromUnit === '°F' && toUnit === '°C') return (((val - 32) * 5) / 9).toFixed(1);
      return String(val);
    }
    return String(val);
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex flex-col bg-[#f9f9f9] dark:bg-[#1a1c20] text-black dark:text-white select-none">
      {/* Top Header */}
      <div className="bg-white dark:bg-[#22252a] border-b border-black/10 dark:border-white/10 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <FluentCalculatorColorIcon className="w-7 h-7 shrink-0 drop-shadow-sm" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                Máy tính (Calculator)
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-[#0078d4]/15 text-[#0078d4] dark:text-[#4cc2ff] text-[10px] font-bold uppercase tracking-wider">
                Fluent WinUI
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Công cụ tính toán số học, hàm khoa học và chuyển đổi đơn vị chuẩn Windows 11
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 bg-black/5 dark:bg-white/10 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setMode('standard')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              mode === 'standard'
                ? 'bg-white dark:bg-[#2e3238] text-[#0078d4] dark:text-[#4cc2ff] shadow-xs'
                : 'text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white'
            }`}
          >
            Tiêu chuẩn
          </button>
          <button
            type="button"
            onClick={() => setMode('scientific')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              mode === 'scientific'
                ? 'bg-white dark:bg-[#2e3238] text-[#0078d4] dark:text-[#4cc2ff] shadow-xs'
                : 'text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white'
            }`}
          >
            Khoa học
          </button>
          <button
            type="button"
            onClick={() => setMode('converter')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              mode === 'converter'
                ? 'bg-white dark:bg-[#2e3238] text-[#0078d4] dark:text-[#4cc2ff] shadow-xs'
                : 'text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white'
            }`}
          >
            Chuyển đổi
          </button>
          <button
            type="button"
            onClick={() => setShowHistory(prev => !prev)}
            title="Lịch sử tính toán"
            className={`p-1.5 rounded-md text-xs transition-all cursor-pointer ${
              showHistory
                ? 'bg-[#0078d4] text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex max-w-5xl mx-auto w-full p-4 sm:p-6 gap-6 justify-center">
        {/* Calculator Main Box */}
        <div className="w-full max-w-md bg-white dark:bg-[#23272d] border border-black/10 dark:border-white/10 rounded-2xl shadow-xl p-5 sm:p-6 flex flex-col justify-between">
          
          {mode !== 'converter' ? (
            <>
              {/* Display Area */}
              <div className="flex flex-col items-end justify-end mb-4 pt-2">
                <div className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-mono h-5 truncate max-w-full">
                  {expression || ''}
                </div>
                <div className="flex items-center justify-between w-full mt-1">
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    title="Sao chép kết quả"
                    className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedToast ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <div className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white font-mono truncate text-right">
                    {displayValue}
                  </div>
                </div>
              </div>

              {/* Memory Bar */}
              <div className="flex items-center justify-between gap-1 mb-3 pb-2 border-b border-black/5 dark:border-white/10 text-xs">
                <button
                  type="button"
                  disabled={!isMemorySet}
                  onClick={() => handleMemory('MC')}
                  className="px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 font-semibold cursor-pointer"
                >
                  MC
                </button>
                <button
                  type="button"
                  disabled={!isMemorySet}
                  onClick={() => handleMemory('MR')}
                  className="px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 font-semibold cursor-pointer"
                >
                  MR
                </button>
                <button
                  type="button"
                  onClick={() => handleMemory('M+')}
                  className="px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10 font-semibold cursor-pointer"
                >
                  M+
                </button>
                <button
                  type="button"
                  onClick={() => handleMemory('M-')}
                  className="px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10 font-semibold cursor-pointer"
                >
                  M-
                </button>
                <button
                  type="button"
                  onClick={() => handleMemory('MS')}
                  className="px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10 font-semibold cursor-pointer"
                >
                  MS
                </button>
                {mode === 'scientific' && (
                  <button
                    type="button"
                    onClick={() => setAngleUnit(prev => (prev === 'deg' ? 'rad' : 'deg'))}
                    className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[10px] font-bold uppercase text-[#0078d4] dark:text-[#4cc2ff] cursor-pointer"
                  >
                    {angleUnit}
                  </button>
                )}
              </div>

              {/* Scientific Rows (if scientific mode is on) */}
              {mode === 'scientific' && (
                <div className="grid grid-cols-5 gap-1.5 mb-2">
                  <button
                    type="button"
                    onClick={() => handleScientificUnary('sin')}
                    className="py-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold cursor-pointer"
                  >
                    sin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScientificUnary('cos')}
                    className="py-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold cursor-pointer"
                  >
                    cos
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScientificUnary('tan')}
                    className="py-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold cursor-pointer"
                  >
                    tan
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScientificUnary('pi')}
                    className="py-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold cursor-pointer"
                  >
                    π
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScientificUnary('e')}
                    className="py-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold cursor-pointer"
                  >
                    e
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScientificUnary('ln')}
                    className="py-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold cursor-pointer"
                  >
                    ln
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScientificUnary('log')}
                    className="py-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold cursor-pointer"
                  >
                    log
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScientificUnary('fact')}
                    className="py-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold cursor-pointer"
                  >
                    n!
                  </button>
                  <button
                    type="button"
                    onClick={() => performOperation('x^y')}
                    className="py-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold cursor-pointer"
                  >
                    xʸ
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScientificUnary('abs')}
                    className="py-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold cursor-pointer"
                  >
                    |x|
                  </button>
                </div>
              )}

              {/* Standard Keypad Grid */}
              <div className="grid grid-cols-4 gap-2">
                {/* Row 1 */}
                <button
                  type="button"
                  onClick={() => performOperation('%')}
                  className="h-12 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] active:scale-95 text-sm font-semibold transition-transform cursor-pointer"
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={clearEntry}
                  className="h-12 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] active:scale-95 text-sm font-semibold transition-transform cursor-pointer"
                >
                  CE
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="h-12 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] active:scale-95 text-sm font-semibold transition-transform cursor-pointer"
                >
                  C
                </button>
                <button
                  type="button"
                  onClick={deleteLastChar}
                  className="h-12 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] active:scale-95 flex items-center justify-center transition-transform cursor-pointer"
                >
                  <Delete className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
                </button>

                {/* Row 2 */}
                <button
                  type="button"
                  onClick={() => handleScientificUnary('recip')}
                  className="h-12 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] active:scale-95 text-sm font-semibold transition-transform cursor-pointer font-serif italic"
                >
                  1/x
                </button>
                <button
                  type="button"
                  onClick={() => handleScientificUnary('sqr')}
                  className="h-12 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] active:scale-95 text-sm font-semibold transition-transform cursor-pointer"
                >
                  x²
                </button>
                <button
                  type="button"
                  onClick={() => handleScientificUnary('sqrt')}
                  className="h-12 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] active:scale-95 text-sm font-semibold transition-transform cursor-pointer"
                >
                  ²√x
                </button>
                <button
                  type="button"
                  onClick={() => performOperation('÷')}
                  className="h-12 rounded-xl bg-[#0078d4]/10 dark:bg-[#4cc2ff]/15 text-[#0078d4] dark:text-[#4cc2ff] hover:bg-[#0078d4]/20 active:scale-95 text-xl font-semibold transition-transform cursor-pointer"
                >
                  ÷
                </button>

                {/* Row 3 */}
                <button
                  type="button"
                  onClick={() => inputDigit('7')}
                  className="h-12 rounded-xl bg-white dark:bg-[#2c3138] border border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 text-lg font-bold transition-transform cursor-pointer shadow-2xs"
                >
                  7
                </button>
                <button
                  type="button"
                  onClick={() => inputDigit('8')}
                  className="h-12 rounded-xl bg-white dark:bg-[#2c3138] border border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 text-lg font-bold transition-transform cursor-pointer shadow-2xs"
                >
                  8
                </button>
                <button
                  type="button"
                  onClick={() => inputDigit('9')}
                  className="h-12 rounded-xl bg-white dark:bg-[#2c3138] border border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 text-lg font-bold transition-transform cursor-pointer shadow-2xs"
                >
                  9
                </button>
                <button
                  type="button"
                  onClick={() => performOperation('×')}
                  className="h-12 rounded-xl bg-[#0078d4]/10 dark:bg-[#4cc2ff]/15 text-[#0078d4] dark:text-[#4cc2ff] hover:bg-[#0078d4]/20 active:scale-95 text-xl font-semibold transition-transform cursor-pointer"
                >
                  ×
                </button>

                {/* Row 4 */}
                <button
                  type="button"
                  onClick={() => inputDigit('4')}
                  className="h-12 rounded-xl bg-white dark:bg-[#2c3138] border border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 text-lg font-bold transition-transform cursor-pointer shadow-2xs"
                >
                  4
                </button>
                <button
                  type="button"
                  onClick={() => inputDigit('5')}
                  className="h-12 rounded-xl bg-white dark:bg-[#2c3138] border border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 text-lg font-bold transition-transform cursor-pointer shadow-2xs"
                >
                  5
                </button>
                <button
                  type="button"
                  onClick={() => inputDigit('6')}
                  className="h-12 rounded-xl bg-white dark:bg-[#2c3138] border border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 text-lg font-bold transition-transform cursor-pointer shadow-2xs"
                >
                  6
                </button>
                <button
                  type="button"
                  onClick={() => performOperation('−')}
                  className="h-12 rounded-xl bg-[#0078d4]/10 dark:bg-[#4cc2ff]/15 text-[#0078d4] dark:text-[#4cc2ff] hover:bg-[#0078d4]/20 active:scale-95 text-xl font-semibold transition-transform cursor-pointer"
                >
                  −
                </button>

                {/* Row 5 */}
                <button
                  type="button"
                  onClick={() => inputDigit('1')}
                  className="h-12 rounded-xl bg-white dark:bg-[#2c3138] border border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 text-lg font-bold transition-transform cursor-pointer shadow-2xs"
                >
                  1
                </button>
                <button
                  type="button"
                  onClick={() => inputDigit('2')}
                  className="h-12 rounded-xl bg-white dark:bg-[#2c3138] border border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 text-lg font-bold transition-transform cursor-pointer shadow-2xs"
                >
                  2
                </button>
                <button
                  type="button"
                  onClick={() => inputDigit('3')}
                  className="h-12 rounded-xl bg-white dark:bg-[#2c3138] border border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 text-lg font-bold transition-transform cursor-pointer shadow-2xs"
                >
                  3
                </button>
                <button
                  type="button"
                  onClick={() => performOperation('+')}
                  className="h-12 rounded-xl bg-[#0078d4]/10 dark:bg-[#4cc2ff]/15 text-[#0078d4] dark:text-[#4cc2ff] hover:bg-[#0078d4]/20 active:scale-95 text-xl font-semibold transition-transform cursor-pointer"
                >
                  +
                </button>

                {/* Row 6 */}
                <button
                  type="button"
                  onClick={toggleSign}
                  className="h-12 rounded-xl bg-white dark:bg-[#2c3138] border border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 text-base font-bold transition-transform cursor-pointer shadow-2xs"
                >
                  ±
                </button>
                <button
                  type="button"
                  onClick={() => inputDigit('0')}
                  className="h-12 rounded-xl bg-white dark:bg-[#2c3138] border border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 text-lg font-bold transition-transform cursor-pointer shadow-2xs"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={inputDecimal}
                  className="h-12 rounded-xl bg-white dark:bg-[#2c3138] border border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 text-lg font-bold transition-transform cursor-pointer shadow-2xs"
                >
                  .
                </button>
                <button
                  type="button"
                  onClick={handleEqual}
                  className="h-12 rounded-xl bg-[#0078d4] dark:bg-[#4cc2ff] text-white dark:text-black hover:bg-[#006cbd] dark:hover:bg-[#6bd0ff] active:scale-95 text-xl font-bold transition-transform shadow-md cursor-pointer flex items-center justify-center"
                >
                  <Equal className="w-6 h-6" />
                </button>
              </div>
            </>
          ) : (
            /* Unit Converter Mode */
            <div className="space-y-5 py-2">
              <div className="flex gap-2 border-b border-black/10 dark:border-white/10 pb-3">
                <button
                  type="button"
                  onClick={() => {
                    setConvertCategory('currency');
                    setFromUnit('VND');
                    setToUnit('USD');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    convertCategory === 'currency' ? 'bg-[#0078d4] text-white' : 'hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  Tiền tệ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConvertCategory('length');
                    setFromUnit('m');
                    setToUnit('ft');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    convertCategory === 'length' ? 'bg-[#0078d4] text-white' : 'hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  Chiều dài
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConvertCategory('temp');
                    setFromUnit('°C');
                    setToUnit('°F');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    convertCategory === 'temp' ? 'bg-[#0078d4] text-white' : 'hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  Nhiệt độ
                </button>
              </div>

              {/* Input Value */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500">Giá trị ban đầu ({fromUnit}):</label>
                <input
                  type="number"
                  value={convertValue}
                  onChange={(e) => setConvertValue(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 font-mono text-lg font-bold outline-none focus:border-[#0078d4]"
                />
              </div>

              {/* Units Selection */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <span className="text-[11px] text-neutral-400">Từ</span>
                  <select
                    value={fromUnit}
                    onChange={(e) => setFromUnit(e.target.value)}
                    className="w-full p-2 rounded-lg bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 text-xs font-semibold"
                  >
                    {convertCategory === 'currency' && (
                      <>
                        <option value="VND">Việt Nam Đồng (VND)</option>
                        <option value="USD">Đô la Mỹ (USD)</option>
                        <option value="EUR">Euro (EUR)</option>
                      </>
                    )}
                    {convertCategory === 'length' && (
                      <>
                        <option value="m">Mét (m)</option>
                        <option value="km">Kilômét (km)</option>
                        <option value="ft">Foot (ft)</option>
                        <option value="mi">Dặm (mi)</option>
                      </>
                    )}
                    {convertCategory === 'temp' && (
                      <>
                        <option value="°C">Độ C (°C)</option>
                        <option value="°F">Độ F (°F)</option>
                      </>
                    )}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const temp = fromUnit;
                    setFromUnit(toUnit);
                    setToUnit(temp);
                  }}
                  className="mt-4 p-2 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 text-neutral-500 cursor-pointer"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>

                <div className="flex-1 space-y-1">
                  <span className="text-[11px] text-neutral-400">Sang</span>
                  <select
                    value={toUnit}
                    onChange={(e) => setToUnit(e.target.value)}
                    className="w-full p-2 rounded-lg bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 text-xs font-semibold"
                  >
                    {convertCategory === 'currency' && (
                      <>
                        <option value="USD">Đô la Mỹ (USD)</option>
                        <option value="VND">Việt Nam Đồng (VND)</option>
                        <option value="EUR">Euro (EUR)</option>
                      </>
                    )}
                    {convertCategory === 'length' && (
                      <>
                        <option value="ft">Foot (ft)</option>
                        <option value="m">Mét (m)</option>
                        <option value="mi">Dặm (mi)</option>
                        <option value="km">Kilômét (km)</option>
                      </>
                    )}
                    {convertCategory === 'temp' && (
                      <>
                        <option value="°F">Độ F (°F)</option>
                        <option value="°C">Độ C (°C)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Conversion Result Box */}
              <div className="p-4 rounded-xl bg-[#0078d4]/10 dark:bg-[#4cc2ff]/10 border border-[#0078d4]/20 flex flex-col items-center justify-center">
                <span className="text-xs text-neutral-500 font-medium">Kết quả chuyển đổi:</span>
                <span className="text-2xl font-bold text-[#0078d4] dark:text-[#4cc2ff] font-mono mt-1">
                  {calculateConversion()} {toUnit}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* History Sidebar Panel */}
        {showHistory && (
          <div className="w-72 bg-white dark:bg-[#23272d] border border-black/10 dark:border-white/10 rounded-2xl shadow-xl p-4 flex flex-col justify-between animate-fade-in shrink-0">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10 mb-3">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-[#0078d4] dark:text-[#4cc2ff]" />
                  <span className="text-xs font-bold uppercase tracking-wider">Lịch sử phép tính</span>
                </div>
                <button
                  type="button"
                  onClick={() => setHistory([])}
                  title="Xóa toàn bộ lịch sử"
                  className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 text-neutral-400 hover:text-rose-500 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {history.length === 0 ? (
                  <div className="text-center py-10 text-xs text-neutral-400">
                    Chưa có lịch sử tính toán nào
                  </div>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setDisplayValue(item.result);
                        setExpression(item.expression);
                      }}
                      className="p-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-right group border border-transparent hover:border-black/5 dark:hover:border-white/5"
                    >
                      <div className="text-[11px] text-neutral-500 font-mono truncate">{item.expression} =</div>
                      <div className="text-base font-bold text-neutral-900 dark:text-white font-mono group-hover:text-[#0078d4] dark:group-hover:text-[#4cc2ff]">
                        {item.result}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-black/10 dark:border-white/10 text-[11px] text-neutral-400 text-center">
              Nhấp vào một phép tính để nạp lại kết quả
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
