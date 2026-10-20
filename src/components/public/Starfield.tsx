import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../../utils/useReducedMotion';

interface Star { x: number; y: number; radius: number; phase: number; depth: number }

export function Starfield({ paused }: { paused: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !context) return;
    let stars: Star[] = [];
    let width = 0; let height = 0; let frame = 0;
    let offset = 0; let target = 0;
    const staticMode = reduced || paused;
    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      stars.forEach((star) => {
        const alpha = staticMode ? .38 : .24 + (Math.sin(time * .00045 + star.phase) + 1) * .18;
        context.beginPath();
        context.fillStyle = `rgba(170,210,223,${alpha})`;
        context.arc(star.x, (star.y - offset * star.depth + height) % height, star.radius, 0, Math.PI * 2);
        context.fill();
      });
    };
    const animate = (time: number) => {
      offset += (target - offset) * .025;
      draw(time); frame = window.requestAnimationFrame(animate);
    };
    const resume = () => {
      window.cancelAnimationFrame(frame);
      canvas.dataset.motion = document.hidden ? 'paused' : staticMode ? 'static' : 'animated';
      if (document.hidden) return;
      draw(0);
      if (!staticMode) frame = window.requestAnimationFrame(animate);
    };
    const resize = () => {
      width = window.innerWidth; height = Math.max(1, window.innerHeight);
      const ratio = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = width < 640 ? 28 : width < 1024 ? 48 : 76;
      stars = Array.from({ length: count }, () => ({ x: Math.random() * width, y: Math.random() * height,
        radius: Math.random() * .9 + .35, phase: Math.random() * Math.PI * 2, depth: Math.random() * .4 + .2 }));
      canvas.dataset.stars = String(count); resume();
    };
    const onScroll = () => { target = staticMode ? 0 : Math.min(window.scrollY * .025, 50); };
    resize(); onScroll();
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', resume);
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll); document.removeEventListener('visibilitychange', resume); };
  }, [paused, reduced]);
  return <canvas ref={ref} className="starfield" aria-hidden="true" />;
}
