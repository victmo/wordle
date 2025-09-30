import { useState } from 'react';

import { Wordle } from './Wordle.tsx';

function App() {
  const [word, setWord] = useState('cacas');

  return (
    <>
      <h1>Wordle</h1>
      <Wordle word={word} length={5} attempts={6} />
    </>
  );
}

export default App;
