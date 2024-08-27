import { useState, useEffect } from 'react';

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

const BallBouncer = () => {
  const [balls, setBalls] = useState<Ball[]>([
    {
      x: 50,
      y: 50,
      vx: 4,
      vy: 2,
      radius: 10,
    },
  ]);

  const [gravity, setGravity] = useState(0.2);
  const [airResistance, setAirResistance] = useState(0.999);
  const [bounceDamping, setBounceDamping] = useState(0.7);

  const [canvasWidth, setCanvasWidth] = useState(window.innerWidth - 30);
  const [canvasHeight, setCanvasHeight] = useState(window.innerHeight - 40);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const newBalls = balls.map((ball) => {
        const newBall = { ...ball };

        newBall.x += newBall.vx;
        newBall.y += newBall.vy;
        newBall.vy += gravity;

        newBall.vx *= airResistance;
        newBall.vy *= airResistance;

        if (newBall.y + newBall.radius > canvasHeight) {
          newBall.vy = -newBall.vy * bounceDamping;
          newBall.y = canvasHeight - newBall.radius;
        }

        if (newBall.x + newBall.radius > canvasWidth || newBall.x - newBall.radius < 0) {
          newBall.vx = -newBall.vx * bounceDamping;
        }

        if (newBall.y + newBall.radius > canvasHeight - 5 && Math.abs(newBall.vy) < 0.5) {
          newBall.vx = 0;
          newBall.vy = 0;
        }

        return newBall;
      });

      setBalls(newBalls);
    }, 16);

    return () => clearInterval(intervalId);
  }, [balls, gravity, airResistance, bounceDamping, canvasWidth, canvasHeight]);

  useEffect(() => {
    const handleResize = () => {
      setCanvasWidth(window.innerWidth);
      setCanvasHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = (event: React.MouseEvent) => {
    const newBall: Ball = {
      x: event.clientX,
      y: event.clientY,
      vx: Math.random() * 4 - 2,
      vy: 0,
      radius: 10,
    };

    setBalls((prevBalls) => [...prevBalls, newBall]);
  };

  return (
    <div
      className="h-screen w-screen overflow-hidden bg-gray-100"
      onMouseDown={handleMouseDown}
    >
      {balls.map((ball, index) => (
        <div
          key={index}
          className="absolute rounded-full bg-blue-500"
          style={{
            left: `${ball.x}px`,
            top: `${ball.y}px`,
            width: `${ball.radius * 2}px`,
            height: `${ball.radius * 2}px`,
          }}
        />
      ))}
    </div>
  );
};

export default BallBouncer;
