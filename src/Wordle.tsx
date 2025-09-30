import './Wordle.css';

import { useState } from 'react';

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

  return (
    <div>
      <h2>Hint: {word}</h2>
      <div className="board">
        <Line value="beast" complete length={length} word={word} />
        <Line value="bemak" complete length={length} word={word} />
        <Line value="asd" length={length} word={word} />
        <Line length={length} word={word} />
      </div>

      <Keyboard
        rows={keyboardRows}
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
};

export const Keyboard = (props: KeyboardProps) => {
  const { rows, guessedLetters } = props;
  return (
    <div className="keyboard">
      {rows.map((row, i) => (
        <div key={i} className="keyboard-row">
          {row.split('').map(letter => {
            const status = guessedLetters.get(letter) || 'empty';
            return (
              <button key={letter} className={`key ${status}`}>
                {letter}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};
