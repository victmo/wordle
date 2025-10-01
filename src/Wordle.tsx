import './Wordle.css';

import { useCallback, useEffect, useMemo, useState } from 'react';

const keyboardRows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']; // qwerty layout
const alphabet = keyboardRows.join('');

type LetterStatus = 'correct' | 'misplaced' | 'wrong' | 'empty';
type GuessedLetters = Map<string, LetterStatus>;
type GuessedWord = [string, LetterStatus][];

export type WordleProps = {
  /** Five letter word/solution */
  word: string;

  /** Length of the words */
  length: number;

  /** Max number of attempts */
  attempts: number;
};

// The TypeScript team itself recommends: annotate at API boundaries
// (like exported functions in a library), but skip it for internal
// functions and components where inference is straightforward.

export const Wordle = (props: WordleProps) => {
  const { word, length, attempts } = props;
  const [guesses, setGuesses] = useState<GuessedWord[]>([]);
  const [currentValue, setCurrentValue] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);

  const submitGuess = useCallback(
    (guess: string) => {
      if (guess.length !== length) {
        return;
      }

      const result: GuessedWord = [];
      const w = word.split('');

      for (let i = 0; i < length; i++) {
        const letter = guess[i];
        const index = w.indexOf(letter);

        if (index === -1) {
          result[i] = [letter, 'wrong'];
        } else {
          result[i] = [letter, index === i ? 'correct' : 'misplaced'];
          w[index] = ''; // Prevent double counting
        }
      }

      const newGuesses = [...guesses, result];
      const won = guess === word;
      const over = won || newGuesses.length >= attempts;

      setGuesses(newGuesses);
      setIsWin(won);
      setIsGameOver(over);
      setCurrentValue('');
    },
    [attempts, guesses, length, word]
  );

  const toEmptyGuessedWord = useCallback((s: string): GuessedWord => {
    const letters = s.split('').map(letter => [letter, 'empty'] as [string, LetterStatus]);
    return letters;
  }, []);

  // Handle (virtual and physical) key presses
  const handleKeyPress = useCallback(
    (key: string) => {
      const letter = key.toLowerCase();

      if (key === 'Enter') {
        submitGuess(currentValue);
      } else if (key === 'Backspace') {
        setCurrentValue(currentValue.slice(0, -1));
      } else if (alphabet.includes(letter) && currentValue.length < length) {
        setCurrentValue(currentValue + letter);
      }
    },
    [currentValue, length, submitGuess]
  );

  // Add keyboard listener
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (!isGameOver) {
        handleKeyPress(e.key);
      }
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [isGameOver, currentValue, guesses, handleKeyPress]);

  // Derive keyboard state from guesses
  const guessedLetters = useMemo<GuessedLetters>(() => {
    const map = new Map<string, LetterStatus>();
    for (const guess of guesses) {
      for (const [letter, status] of guess) {
        if (map.get(letter) === 'correct') {
          continue; // Already correct, can't do better
        }
        map.set(letter, status);
      }
    }
    return map;
  }, [guesses]);

  return (
    <div className="wordle">
      <div className="board">
        {Array.from({ length: attempts }).map((_, i) => (
          <Line
            key={i}
            length={length}
            letters={i === guesses.length ? toEmptyGuessedWord(currentValue) : guesses[i]}
          />
        ))}
      </div>

      <Keyboard
        rows={keyboardRows}
        onKeyPress={isGameOver ? undefined : handleKeyPress}
        guessedLetters={guessedLetters}
      />
    </div>
  );
};

type LineProps = {
  length: number;
  letters?: GuessedWord;
};
export const Line = (props: LineProps) => {
  const { length, letters = [] } = props;

  const tiles = [];

  for (let i = 0; i < length; i++) {
    const [letter, status] = (letters[i] || ['', 'empty']) as GuessedWord[number];
    tiles[i] = <Tile key={i} value={letter} status={status} />;
  }

  return <div className="line">{tiles}</div>;
};

type TileProps = {
  value: string;
  status: LetterStatus;
};

export const Tile = (props: TileProps) => {
  const { value, status } = props;
  return <div className={`tile ${status}`}>{value}</div>;
};

type KeyboardProps = {
  rows: string[];
  guessedLetters: GuessedLetters;
  onKeyPress?: (key: string) => void;
};

export const Keyboard = (props: KeyboardProps) => {
  const { rows, guessedLetters, onKeyPress } = props;
  return (
    <div className="keyboard">
      {rows.map((row, i) => (
        <div key={i} className="keyboard-row">
          {row.split('').map(letter => {
            const status = guessedLetters.get(letter) || 'empty';
            return (
              <button
                key={letter}
                className={`key ${status}`}
                type="button"
                onClick={() => onKeyPress?.(letter)}
              >
                {letter}
              </button>
            );
          })}
          {i === rows.length - 1 && (
            <>
              <button
                type="button"
                className="key empty enter"
                onClick={() => onKeyPress?.('Enter')}
              >
                <span>Enter</span>
              </button>

              <button
                type="button"
                className="key empty backspace"
                onClick={() => onKeyPress?.('Backspace')}
              >
                <span>⌫</span>
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};
