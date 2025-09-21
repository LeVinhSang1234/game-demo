import { useState } from "react";
import Intro from "./screens/Intro";
import Game from "./screens/Game";

function App() {
  const [isStart, setIsStart] = useState(false);

  return (
    <div className="App">
      {isStart ? <Game /> : <Intro onStart={() => setIsStart(true)} />}
    </div>
  );
}

export default App;
