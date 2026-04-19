import { useEffect, useRef } from 'react';

type Transform = { x: number; y: number; k: number };

type Star = {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  twinkle: number;
  depth: number;
  hue: number;
};

type Props = {
  width: number;
  height: number;
  transformRef: { current: Transform };
};

export default function Starfield({ width, height, transformRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);

  useEffect(() => {
    const stars: Star[] = [];
    const count = 450;
    for (let i = 0; i < count; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 4000,
        y: (Math.random() - 0.5) * 4000,
        r: Math.pow(Math.random(), 2.2) * 1.6 + 0.2,
        baseAlpha: Math.random() * 0.55 + 0.25,
        twinkle: Math.random() * Math.PI * 2,
        depth: Math.pow(Math.random(), 1.6) * 0.85 + 0.1,
        hue: Math.random() < 0.15 ? 200 + Math.random() * 40 : 210 + Math.random() * 30,
      });
    }
    starsRef.current = stars;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !width || !height) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let raf = 0;
    const start = performance.now();
    const draw = (now: number) => {
      const t = (now - start) / 1000;
      const tr = transformRef.current;
      ctx.clearRect(0, 0, width, height);
      for (const s of starsRef.current) {
        const px = s.x * s.depth + tr.x * s.depth + width / 2;
        const py = s.y * s.depth + tr.y * s.depth + height / 2;
        if (px < -4 || px > width + 4 || py < -4 || py > height + 4) continue;
        const a = s.baseAlpha * (0.55 + 0.45 * Math.sin(t * 1.3 + s.twinkle));
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 70%, 85%, ${a})`;
        ctx.fill();
        if (s.r > 1.1) {
          ctx.beginPath();
          ctx.arc(px, py, s.r * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${s.hue}, 90%, 80%, ${a * 0.18})`;
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [width, height]);

  return <canvas ref={canvasRef} className="starfield-canvas" />;
}
