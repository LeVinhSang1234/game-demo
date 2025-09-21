import "./intro.css";

type Props = {
  onStart?: () => void;
};

export default function Intro({ onStart }: Props) {
  return (
    <div className="intro">
      <h2> How the Simulator Works:</h2>
      <p>
        After you click on the START button below, you will begin viewing a
        scene at a public appearance where you are protecting an at-risk public
        figure.
      </p>
      <p>
        If you see someone in the crowd with a gun, press the space bar or touch
        the screen as quickly as possible.
      </p>
      <p>
        Once you hear gunfire important time has already passed. Your score
        decreases with every shot fired and every second that passes. Each gun
        carries six rounds of ammunition.
      </p>
      <button onClick={onStart}>Start</button>
    </div>
  );
}
