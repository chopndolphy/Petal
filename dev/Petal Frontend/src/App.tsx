import { useState, useEffect, useRef } from 'react'
import './App.css'

function Dial()
{
  return(
    <div>
      <h1>I'm Petal!</h1>
    </div>
  )
};

function Toggle({ size = 35 }: { size?: number }) {
  const [state, setState] = useState(false);
  const [mouseOver, setMouseOver] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = size * ratio;
      canvas.height = size * ratio;
      ctx.scale(ratio, ratio);
      ctx.clearRect(0, 0, size, size);

      let color = state ? "#e2f422" : "#444444";
      if (mouseOver)
      {
        color = "#ffffff";
      }

      ctx.beginPath();
      ctx.roundRect(size * 0.05, size * 0.05, size * 0.9, size * 0.9, size * 0.125);
      ctx.strokeStyle = color
      ctx.stroke();

      ctx.beginPath();
      ctx.roundRect(size * 0.125, size * 0.125, size * 0.75, size * 0.75, size * 0.1);
      ctx.fillStyle = color
      ctx.fill();
    }
  }, [size, state, mouseOver]);

  function handleClick()
  {
    setState(!state);
  }

  function handleMouseEnter()
  {
    setMouseOver(true)
  }

  function handleMouseLeave() {
    setMouseOver(false)
  }

  return (
    <div>
      <canvas ref={canvasRef} 
      width={size} 
      height={size} 
      onClick={handleClick} 
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave}/>
    </div>
  );
}


function App() {

  return (
      <div>
        <h1>Hey</h1>
          <Dial />
        <div>
          <Toggle />
          <Toggle />
          <Toggle />
          <Toggle />
        </div>

      <div>
        <Toggle />
        <Toggle />
        <Toggle />
        <Toggle />
      </div>
      </div>
      

  )
}

export default App
