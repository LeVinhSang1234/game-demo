import React, { useState, useEffect, useCallback, Fragment } from "react";
import GameCanvas from "./GameCanvas";
import { images } from "../../game";
import "./index.css";

const Countdown: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => {
        if (count === 1) {
          onFinish();
        } else {
          setCount((prev) => prev - 1);
        }
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [count, onFinish]);

  return (
    <div className="ready">
      <h1 style={{ color: "white" }}>Get Ready...</h1>
      <p className="animated" key={count}>
        {count}
      </p>
    </div>
  );
};
export default function Game() {
  const [isReady, setIsReady] = useState(false);
  const [preloadedImgs, setPreloadedImgs] = useState<HTMLImageElement[]>([]);
  const [preloadedCircleImgs, setPreloadedCircleImgs] = useState<
    HTMLImageElement[]
  >([]);
  const [loaded, setLoaded] = useState(false);
  const [result, setResult] = useState<null | {
    imgIndex: number;
    score: number;
    percent: number;
    loopIndexEnd: number;
  }>(null);

  useEffect(() => {
    const imgArr = images.b64.flat();
    const imgs = imgArr.map(async (base64) => {
      return new Promise((res) => {
        const img = new window.Image();
        img.onload = () => {
          res(img);
        };
        img.src = `data:image/png;base64,${base64}`;
      }) as Promise<HTMLImageElement>;
    });
    Promise.all(imgs)
      .then(setPreloadedImgs)
      .finally(() => {
        setLoaded(true);
      });
  }, []);

  useEffect(() => {
    const imgArr = images.circles.flat();
    const imgs = imgArr.map(async (base64: string) => {
      return new Promise((res) => {
        const img = new window.Image();
        img.onload = () => res(img);
        img.src = `data:image/png;base64,${base64}`;
      }) as Promise<HTMLImageElement>;
    });
    Promise.all(imgs).then(setPreloadedCircleImgs);
  }, []);

  const onFinish = useCallback((res: any) => {
    console.log("res", res);
    setResult(res);
  }, []);

  const onTryAgain = useCallback(() => {
    setIsReady(false);
    setResult(null);
  }, []);

  if (!isReady) return <Countdown onFinish={() => setIsReady(true)} />;

  if (!loaded) {
    return (
      <div className="ready">
        <h1 style={{ color: "white" }}>Đang tải ảnh...</h1>
      </div>
    );
  }

  return (
    <>
      <GameCanvas
        preloadedImgs={preloadedImgs}
        preloadedCircleImgs={preloadedCircleImgs}
        onFinish={onFinish}
      />
      {result &&
      result.imgIndex !== undefined &&
      result.imgIndex < preloadedImgs.length - 3 ? (
        <>
          <div className="no-gun-overlay">
            NO GUN
            <br />
            PRESENT
          </div>
          <div className="try-again-overlay">
            <button className="try-again-btn" onClick={onTryAgain}>
              Try Again
            </button>
          </div>
        </>
      ) : (
        result &&
        result.score > 0 && (
          <div className="great">
            <div
              style={{
                fontSize: "3rem",
                color: "#ff2222",
                marginBottom: "2rem",
              }}
            >
              {result.score < 90
                ? "Great Effort. Keep Practicing."
                : "Excellent! You reacted super fast!"}
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              You stopped {6 - result.loopIndexEnd} out of 6 shots that could
              have been fired.
              <br />
              You scored {result.percent}
              <br />
              You can improve your score by reacting faster.
            </div>
            <div className="try-again-overlay">
              <button className="try-again-btn" onClick={onTryAgain}>
                Try Again
              </button>
            </div>
          </div>
        )
      )}
    </>
  );
}
