"use client";

import { useEffect } from "react";

const SIZE = 32;
const FRAME_MS = 120;

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  colors: [string, string, string],
  offsetY: number,
  glow: string,
) {
  const cy = y + offsetY;
  ctx.save();
  ctx.shadowColor = glow;
  ctx.shadowBlur = 4 + Math.abs(offsetY) * 1.5;
  const gradient = ctx.createRadialGradient(x - r * 0.35, cy - r * 0.35, 0, x, cy, r);
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(0.3, colors[1]);
  gradient.addColorStop(1, colors[2]);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 0.6;
  ctx.stroke();
  ctx.restore();
}

function drawFrame(ctx: CanvasRenderingContext2D, tick: number) {
  const t = tick * 0.09;
  const pulse = (phase: number) => Math.sin(t + phase) * 2;

  ctx.clearRect(0, 0, SIZE, SIZE);

  const bg = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  bg.addColorStop(0, "#ffffff");
  bg.addColorStop(0.46, "#e6f3fc");
  bg.addColorStop(1, "#d4e8f8");
  roundRect(ctx, 0.5, 0.5, SIZE - 1, SIZE - 1, 8);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.strokeStyle = "#008cd2";
  ctx.lineWidth = 1.25;
  ctx.stroke();

  drawDot(
    ctx,
    16,
    9.5,
    4.25,
    ["#6fd4ff", "#00aeff", "#006bb8"],
    pulse(0),
    "rgba(0, 174, 255, 0.65)",
  );
  drawDot(
    ctx,
    9,
    21.5,
    4.25,
    ["#84ee84", "#32cd32", "#15803d"],
    pulse(0.9),
    "rgba(50, 205, 50, 0.6)",
  );
  drawDot(
    ctx,
    23,
    21.5,
    4.25,
    ["#ffc98a", "#fb923c", "#dc2626"],
    pulse(1.8),
    "rgba(251, 146, 60, 0.65)",
  );
}

export function AnimatedFavicon() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) {
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const links = Array.from(
      document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]'),
    );
    const link =
      links.find((el) => !el.href.includes("apple")) ??
      (() => {
        const created = document.createElement("link");
        created.rel = "icon";
        document.head.appendChild(created);
        return created;
      })();

    const originalHref = link.href;
    let tick = 0;
    const interval = window.setInterval(() => {
      drawFrame(ctx, tick);
      link.type = "image/png";
      link.href = canvas.toDataURL("image/png");
      tick += 1;
    }, FRAME_MS);

    const onMotionChange = () => {
      if (reducedMotion.matches) {
        link.href = originalHref;
        link.type = "image/svg+xml";
      }
    };
    reducedMotion.addEventListener("change", onMotionChange);

    return () => {
      window.clearInterval(interval);
      reducedMotion.removeEventListener("change", onMotionChange);
      if (originalHref) {
        link.href = originalHref;
      }
    };
  }, []);

  return null;
}
