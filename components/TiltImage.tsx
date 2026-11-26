"use client";
export default function TiltImage({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  function move(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    const image = event.currentTarget.querySelector("img");
    if (image) image.style.transform = `perspective(800px) rotateY(${x * 15}deg) rotateX(${-y * 13}deg) scale(1.045)`;
  }
  function reset(event: React.PointerEvent<HTMLDivElement>) { const image = event.currentTarget.querySelector("img"); if (image) image.style.transform = ""; }
  return <div className="about-photo-wrap tilt-photo" onPointerMove={move} onPointerLeave={reset}><img className={`about-photo ${className}`} src={src} alt={alt} loading="lazy" /></div>;
}
