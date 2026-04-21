import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameStatus, Point } from '../types';
import { motion } from 'motion/react';

const GRID_SIZE = 20;
const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };

interface SnakeGameProps {
  onScoreChange: (score: number) => void;
  gameStatus: GameStatus;
  setGameStatus: (status: GameStatus) => void;
}

export const SnakeGame: React.FC<SnakeGameProps> = ({ onScoreChange, gameStatus, setGameStatus }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const gameLoopRef = useRef<number>(null);
  const lastUpdateRef = useRef<number>(0);
  const speedRef = useRef(150);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    setFood(newFood);
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    onScoreChange(0);
    speedRef.current = 150;
    generateFood(INITIAL_SNAKE);
  };

  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = {
        x: (head.x + direction.x + GRID_SIZE) % GRID_SIZE,
        y: (head.y + direction.y + GRID_SIZE) % GRID_SIZE,
      };

      // Collision with self
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameStatus(GameStatus.GAME_OVER);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Eat food
      if (newHead.x === food.x && newHead.y === food.y) {
        const newScore = score + 10;
        setScore(newScore);
        onScoreChange(newScore);
        generateFood(newSnake);
        // Gradually increase speed
        speedRef.current = Math.max(50, 150 - Math.floor(newScore / 50) * 10);
        return newSnake;
      }

      newSnake.pop();
      return newSnake;
    });
  }, [direction, food, score, onScoreChange, generateFood, setGameStatus]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
        case ' ':
          if (gameStatus === GameStatus.IDLE || gameStatus === GameStatus.GAME_OVER) {
            resetGame();
            setGameStatus(GameStatus.PLAYING);
          } else if (gameStatus === GameStatus.PLAYING) {
            setGameStatus(GameStatus.PAUSED);
          } else if (gameStatus === GameStatus.PAUSED) {
            setGameStatus(GameStatus.PLAYING);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, gameStatus, setGameStatus]);

  useEffect(() => {
    const loop = (time: number) => {
      if (gameStatus === GameStatus.PLAYING) {
        if (time - lastUpdateRef.current > speedRef.current) {
          moveSnake();
          lastUpdateRef.current = time;
        }
      }
      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameStatus, moveSnake]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = canvas.width / GRID_SIZE;

    // Clear canvas
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid (Subtle)
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }

    // Draw Food
    ctx.fillStyle = '#ff0055';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff0055';
    ctx.beginPath();
    ctx.arc(
      food.x * cellSize + cellSize / 2,
      food.y * cellSize + cellSize / 2,
      cellSize / 2.5,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw Snake
    snake.forEach((segment, index) => {
      const isHead = index === 0;
      ctx.fillStyle = isHead ? '#00f2ff' : '#0077ff';
      ctx.shadowBlur = isHead ? 10 : 0;
      ctx.shadowColor = '#00f2ff';
      
      const x = segment.x * cellSize + 2;
      const y = segment.y * cellSize + 2;
      const size = cellSize - 4;
      
      ctx.fillRect(x, y, size, size);
      
      if (isHead) {
        // Draw eyes
        ctx.fillStyle = '#000';
        const eyeSize = size / 5;
        if (direction.x !== 0) {
          ctx.fillRect(x + size * 0.6, y + size * 0.2, eyeSize, eyeSize);
          ctx.fillRect(x + size * 0.6, y + size * 0.7, eyeSize, eyeSize);
        } else {
          ctx.fillRect(x + size * 0.2, y + size * (direction.y > 0 ? 0.6 : 0.2), eyeSize, eyeSize);
          ctx.fillRect(x + size * 0.7, y + size * (direction.y > 0 ? 0.6 : 0.2), eyeSize, eyeSize);
        }
      }
    });
  }, [snake, food, direction]);

  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative bg-[#0a0a0f] rounded-lg overflow-hidden border border-cyan-500/30">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="max-w-full h-auto block"
        />
        
        {gameStatus !== GameStatus.PLAYING && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center">
            {gameStatus === GameStatus.IDLE && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-4xl font-bold mb-4 font-sans tracking-tight text-cyan-400">NEON SNAKE</h2>
                <p className="text-slate-400 mb-6">Use arrow keys to move. Space to start.</p>
                <button
                  onClick={() => { resetGame(); setGameStatus(GameStatus.PLAYING); }}
                  className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-full transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                >
                  START GAME
                </button>
              </motion.div>
            )}
            
            {gameStatus === GameStatus.PAUSED && (
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                <h2 className="text-4xl font-bold mb-4 text-cyan-400">PAUSED</h2>
                <button
                  onClick={() => setGameStatus(GameStatus.PLAYING)}
                  className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-full transition-all"
                >
                  RESUME
                </button>
              </motion.div>
            )}
            
            {gameStatus === GameStatus.GAME_OVER && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <h2 className="text-5xl font-bold mb-2 text-red-500">GAME OVER</h2>
                <p className="text-2xl text-white mb-6">Final Score: <span className="text-cyan-400">{score}</span></p>
                <button
                  onClick={() => { resetGame(); setGameStatus(GameStatus.PLAYING); }}
                  className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-cyan-400 transition-all shadow-lg"
                >
                  TRY AGAIN
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
