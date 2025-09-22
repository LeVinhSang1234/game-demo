import { useCallback, useEffect, useRef } from "react";
import AudioPlayer, { AudioPlayerHandle } from "./AudioPlayer";

interface GameCanvasProps {
  preloadedImgs: HTMLImageElement[];
  preloadedCircleImgs: HTMLImageElement[];
  onFinish?: (result: {
    imgIndex: number;
    score: number;
    percent: number;
    loopIndexEnd: number;
  }) => void;
}

export default function GameCanvas({
  preloadedImgs,
  preloadedCircleImgs,
  onFinish,
}: GameCanvasProps) {
  const audioRef = useRef<AudioPlayerHandle>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgIndex = useRef(0);
  const request = useRef<number>(undefined);
  const loopIndexEnd = useRef(0);
  const lastChange = useRef(Date.now());
  const isImageEnd = useRef(false);

  const drawImage = useCallback(
    (index: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const width = Math.round(window.innerWidth * dpr);
      const height = Math.round(window.innerHeight * dpr);
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const img = preloadedImgs[index];
      if (img && img.complete) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    },
    [preloadedImgs]
  );

  const getScore = useCallback(() => {
    const count = preloadedImgs.length;
    if (imgIndex.current === count - 3) {
      const diff = Date.now() - lastChange.current;
      const step = Math.floor(diff / 200);
      let score = 100 - step * ((100 - 80) / 10);
      score = Math.max(80, Math.min(100, score));
      return score;
    }
    if (imgIndex.current === count - 2) {
      const diff = Date.now() - lastChange.current;
      const step = Math.floor(diff / 200);
      let score = 80 - step * ((80 - 50) / 10);
      score = Math.max(50, Math.min(80, score));
      return score;
    }
    if (imgIndex.current === count - 1) {
      const blinkStep = Math.min(loopIndexEnd.current, 6);
      const score = Math.max(0, Math.round(50 - blinkStep * (50 / 6)));
      return score;
    }
    return 0;
  }, [preloadedImgs.length]);

  const drawImageCircle = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const width = Math.round(window.innerWidth * dpr);
    const height = Math.round(window.innerHeight * dpr);
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (img && img.complete) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  }, []);

  useEffect(() => {
    const count = preloadedImgs.length;
    function loop() {
      const now = Date.now();
      if (loopIndexEnd.current > 6) return;
      if (now - lastChange.current >= 2000 && imgIndex.current <= count - 1) {
        imgIndex.current++;
        if (imgIndex.current === count - 1) audioRef.current?.play();
        drawImage(imgIndex.current);
        lastChange.current = now;
        isImageEnd.current = imgIndex.current === count - 1;
        if (isImageEnd.current) loopIndexEnd.current++;
      } else if (imgIndex.current === count - 1) {
        if (now - lastChange.current >= (isImageEnd.current ? 100 : 500)) {
          drawImage(
            isImageEnd.current ? imgIndex.current - 1 : imgIndex.current
          );
          if (!isImageEnd.current) {
            audioRef.current?.play();
            loopIndexEnd.current++;
          }
          isImageEnd.current = !isImageEnd.current;
          lastChange.current = now;
        }
      }
      request.current = requestAnimationFrame(loop);
    }
    if (count > 0) {
      drawImage(imgIndex.current);
      request.current = requestAnimationFrame(loop);
    }

    const handleFinish = () => {
      const score = getScore();
      if (imgIndex.current >= preloadedImgs.length - 3) {
        drawImageCircle(
          preloadedCircleImgs[3 - (preloadedImgs.length - imgIndex.current)]
        );
      }
      setTimeout(
        () => {
          onFinish?.({
            imgIndex: imgIndex.current,
            score,
            percent: score,
            loopIndexEnd: loopIndexEnd.current,
          });
          window.removeEventListener("keydown", handleKeyDown);
          window.removeEventListener("mousedown", handleMouseDown);
        },
        imgIndex.current >= preloadedImgs.length - 3 ? 500 : 0
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        handleFinish();
        if (request.current) cancelAnimationFrame(request.current);
      }
    };
    const handleMouseDown = () => {
      handleFinish();
      if (request.current) cancelAnimationFrame(request.current);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleMouseDown);

    return () => {
      if (request.current) cancelAnimationFrame(request.current);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, [
    drawImage,
    drawImageCircle,
    getScore,
    onFinish,
    preloadedCircleImgs,
    preloadedImgs.length,
  ]);

  return (
    <div style={{ width: "100dvw", height: "100dvh", position: "relative", overflow: 'hidden' }}>
      <canvas
        style={{ width: "100dvw", height: "100dvh", background: "black" }}
        ref={canvasRef}
      />
      <AudioPlayer ref={audioRef} base64={require("../../game").images.audio} />
    </div>
  );
}
