import './Wordle.css';

import { useCallback, useEffect, useState } from 'react';

const keyboardRows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
const alphabet = keyboardRows.join('');

export type WordleProps = {
  /** Five letter word/solution */
  word: string;
  length: number;
  attempts: number;
};

// The TypeScript team itself recommends: annotate at API boundaries
// (like exported functions in a library), but skip it for internal
// functions and components where inference is straightforward.

export const Wordle = (props: WordleProps) => {
  const { word, length, attempts } = props;
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentValue, setCurrentValue] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);

  // Handle (virtual and physical) key presses
  const handleKeyPress = useCallback(
    (key: string) => {
      const letter = key.toLowerCase();

      if (key === 'Enter') {
        if (currentValue.length !== length) {
          return;
        }
        setGuesses([...guesses, currentValue]);
        setCurrentValue('');
      } else if (key === 'Backspace') {
        setCurrentValue(currentValue.slice(0, -1));
      } else if (alphabet.includes(letter) && currentValue.length < length) {
        setCurrentValue(currentValue + letter);
      }
    },
    [currentValue, guesses, length]
  );

  // Sync game state
  useEffect(() => {
    const won = guesses.includes(word);
    setIsWin(won);

    if (guesses.length >= attempts || won) {
      setIsGameOver(true);
    }
  }, [guesses, word, attempts]);

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

  return (
    <div>
      <h2>Hint: {word}</h2>
      <div className="board">
        {Array.from({ length: attempts }).map((_, i) => (
          <Line
            key={i}
            length={length}
            word={word}
            complete={i < guesses.length}
            value={i === guesses.length ? currentValue : guesses[i]}
          />
        ))}
      </div>

      <Keyboard
        rows={keyboardRows}
        onKeyPress={isGameOver ? undefined : handleKeyPress}
        guessedLetters={
          new Map([
            ['a', 'misplaced'],
            ['b', 'correct'],
            ['e', 'wrong'],
          ])
        }
      />
    </div>
  );
};

type LineProps = {
  length: number;
  word: string;
  value?: string;
  complete?: boolean;
};
export const Line = (props: LineProps) => {
  const { length, word, value = '', complete = false } = props;

  const tiles = [];

  for (let i = 0; i < length; i++) {
    const letter = value[i] || '';
    let status: TileProps['status'] = 'empty';
    if (complete) {
      if (letter === word[i]) {
        status = 'correct';
      } else if (word.includes(letter)) {
        status = 'misplaced';
      } else {
        status = 'wrong';
      }
    }
    tiles[i] = <Tile key={i} value={letter} status={status} />;
  }

  return <div className="line">{tiles}</div>;
};

type LetterStatus = 'correct' | 'misplaced' | 'wrong' | 'empty';

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
  guessedLetters: Map<string, LetterStatus>;
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
                Enter
              </button>

              <button
                type="button"
                className="key empty backspace"
                onClick={() => onKeyPress?.('Backspace')}
              >
                ⌫
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};
