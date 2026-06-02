// Shareable passport card — renders to canvas for download/share
import { typeColor, typeBg } from "../constants/ranks";

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1350;
const PADDING = 60;

export function renderPassportCard(strain, sessions, rank) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = CARD_WIDTH;
    canvas.height = CARD_HEIGHT;
    const ctx = canvas.getContext("2d");

    // ── Background ──
    const bgGrad = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
    bgGrad.addColorStop(0, "#0c0905");
    bgGrad.addColorStop(0.5, "#0f0a04");
    bgGrad.addColorStop(1, "#080502");
    ctx.fillStyle = bgGrad;
    roundRect(ctx, 0, 0, CARD_WIDTH, CARD_HEIGHT, 32);
    ctx.fill();

    // Accent bar
    ctx.fillStyle = typeColor(strain.type) + "22";
    ctx.fillRect(0, 0, CARD_WIDTH, 8);

    // ── Top section ──
    let y = PADDING + 20;

    // Strain name
    ctx.fillStyle = "#fcfcfc";
    ctx.font = "bold 52px system-ui, -apple-system, sans-serif";
    ctx.fillText(strain.name, PADDING, y);
    const nameW = ctx.measureText(strain.name).width;

    // Type badge
    const badgeColor = typeColor(strain.type);
    ctx.font = "600 22px system-ui, sans-serif";
    const typeW = ctx.measureText(strain.type).width;
    const badgeX = PADDING + nameW + 20;
    const badgeY = y - 32;
    const badgeR = 24;
    roundRect(ctx, badgeX, badgeY, typeW + 40, 40, badgeR);
    ctx.fillStyle = typeBg(strain.type);
    ctx.fill();
    ctx.strokeStyle = badgeColor + "88";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = badgeColor;
    ctx.fillText(strain.type, badgeX + 20, y);

    y += 16;

    // Description
    ctx.fillStyle = "#6a8a6a";
    ctx.font = "22px system-ui, sans-serif";
    ctx.fillText(strain.description || "", PADDING, y + 40);

    y += 80;

    // ── Stats row ──
    const stats = [
      { label: "THC", value: strain.thc + "%", color: "#f59e0b" },
      { label: "CBD", value: strain.cbd + "%", color: "#6ee7b7" },
    ];
    ctx.font = "bold 32px system-ui, sans-serif";
    stats.forEach((s, i) => {
      const sx = PADDING + i * 180;
      ctx.fillStyle = s.color;
      ctx.fillText(s.value, sx, y);
      ctx.font = "14px system-ui, sans-serif";
      ctx.fillStyle = "#6a8a6a";
      ctx.fillText(s.label, sx, y + 24);
      ctx.font = "bold 32px system-ui, sans-serif";
    });

    // Avg rating
    ctx.fillStyle = "#a3e635";
    ctx.font = "bold 48px system-ui, sans-serif";
    const avgRat = "8.3";
    ctx.fillText(avgRat, CARD_WIDTH - PADDING - ctx.measureText(avgRat).width, y);
    ctx.font = "14px system-ui, sans-serif";
    ctx.fillStyle = "#6a8a6a";
    ctx.fillText("avg rating", CARD_WIDTH - PADDING - 140, y + 24);

    y += 70;

    // Divider
    ctx.strokeStyle = "#1c2e1c";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PADDING, y);
    ctx.lineTo(CARD_WIDTH - PADDING, y);
    ctx.stroke();

    y += 40;

    // ── Effects ──
    ctx.fillStyle = "#a3e635";
    ctx.font = "600 18px system-ui, sans-serif";
    ctx.fillText("EFFECTS", PADDING, y);
    y += 30;
    ctx.font = "16px system-ui, sans-serif";
    (strain.effects || []).forEach((e, i) => {
      const ex = PADDING + (i % 3) * 200;
      const ey = y + Math.floor(i / 3) * 40;
      ctx.fillStyle = ctx.createLinearGradient(ex, ey, ex + 140, ey);
      const g = ctx.createLinearGradient(ex, ey, ex + 160, ey);
      g.addColorStop(0, "#a3e63522");
      g.addColorStop(1, "transparent");
      roundRect(ctx, ex, ey - 14, 160, 34, 12);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.fillStyle = "#d4f580";
      ctx.fillText(e, ex + 16, ey + 8);
    });

    y += 70;

    // ── Flavors ──
    ctx.fillStyle = "#a3e635";
    ctx.font = "600 18px system-ui, sans-serif";
    ctx.fillText("FLAVORS", PADDING, y);
    y += 30;
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "16px system-ui, sans-serif";
    ctx.fillText((strain.flavors || []).join(" · "), PADDING, y);

    y += 60;

    // Divider
    ctx.strokeStyle = "#1c2e1c";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PADDING, y);
    ctx.lineTo(CARD_WIDTH - PADDING, y);
    ctx.stroke();

    y += 40;

    // ── Experience map ──
    ctx.fillStyle = "#a3e635";
    ctx.font = "600 18px system-ui, sans-serif";
    ctx.fillText("EXPERIENCE MAP", PADDING, y);
    y += 40;

    const bars = [
      { label: "⭐ Quality", v: 85, c: "#f59e0b" },
      { label: "👅 Taste", v: 75, c: "#fb923c" },
      { label: "⚡ Potency", v: 90, c: "#a78bfa" },
      { label: "🌫️ Smooth", v: 70, c: "#67e8f9" },
      { label: "🧠 Clarity", v: 80, c: "#6ee7b7" },
      { label: "💰 Value", v: 65, c: "#fde68a" },
    ];

    bars.forEach((b, i) => {
      const bx = PADDING + i * 160;
      // Label
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "13px system-ui, sans-serif";
      ctx.fillText(b.label, bx, y + 10);

      // Bar bg
      roundRect(ctx, bx, y + 16, 140, 10, 5);
      ctx.fillStyle = "#1c2e1c";
      ctx.fill();

      // Bar fill
      roundRect(ctx, bx, y + 16, (140 * b.v) / 100, 10, 5);
      ctx.fillStyle = b.c;
      ctx.fill();

      // Score
      ctx.fillStyle = b.c;
      ctx.font = "bold 14px system-ui, sans-serif";
      ctx.fillText((b.v / 10).toFixed(1), bx, y + 48);
    });

    y += 100;

    // ── Footer ──
    ctx.fillStyle = "#2a4a2a";
    ctx.font = "14px system-ui, sans-serif";
    ctx.fillText("Terp Journal", PADDING, y);
    ctx.textAlign = "right";
    ctx.fillText(rank?.icon + " " + (rank?.title || ""), CARD_WIDTH - PADDING, y);
    ctx.textAlign = "left";

    y += 30;
    ctx.fillStyle = "#1a2a1a";
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillText("terp-journal.vercel.app", PADDING, y);

    resolve(canvas.toDataURL("image/png"));
  });
}

export function renderStatsCard(xp, rank, totalSessions, topStrain, streak, stash) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");

    // Background
    const bg = ctx.createLinearGradient(0, 0, 1080, 1080);
    bg.addColorStop(0, "#0c0905");
    bg.addColorStop(1, "#0a0500");
    ctx.fillStyle = bg;
    roundRect(ctx, 0, 0, 1080, 1080, 32);
    ctx.fill();

    // Accent
    ctx.fillStyle = "#a3e63522";
    ctx.fillRect(0, 0, 1080, 8);

    // Header
    ctx.fillStyle = "#fcfcfc";
    ctx.font = "bold 56px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("My Resin Stats", 540, 120);

    ctx.fillStyle = "#6a8a6a";
    ctx.font = "24px system-ui, sans-serif";
    ctx.fillText(rank?.icon + " " + (rank?.title || "Explorer"), 540, 170);
    ctx.textAlign = "left";

    // Stats grid
    const statItems = [
      { label: "Total XP", value: xp, color: "#a3e635" },
      { label: "Sessions", value: totalSessions, color: "#f59e0b" },
      { label: "Streak", value: streak + "d", color: "#fb923c" },
      { label: "Top Strain", value: topStrain || "—", color: "#a78bfa" },
      { label: "Stash", value: stash + "g", color: "#6ee7b7" },
    ];

    const gridY = 240;
    statItems.forEach((s, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const sx = 160 + col * 420;
      const sy = gridY + row * 200;

      roundRect(ctx, sx - 30, sy - 20, 360, 160, 20);
      ctx.fillStyle = "#0f0a04";
      ctx.fill();
      ctx.strokeStyle = "#1c2e1c";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = s.color;
      ctx.font = "bold 48px system-ui, sans-serif";
      ctx.fillText(s.value, sx, sy + 50);
      ctx.fillStyle = "#6a8a6a";
      ctx.font = "18px system-ui, sans-serif";
      ctx.fillText(s.label, sx, sy + 90);
    });

    // Footer
    ctx.fillStyle = "#2a4a2a";
    ctx.font = "16px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("terp-journal.vercel.app", 540, 1020);
    ctx.textAlign = "left";

    resolve(canvas.toDataURL("image/png"));
  });
}

// Canvas roundRect helper
function roundRect(ctx, x, y, w, h, r) {
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

// Utility to trigger download
export function downloadImage(dataUrl, filename) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

// Utility to share via Web Share API
export async function shareImage(dataUrl, title) {
  if (!navigator.share) {
    downloadImage(dataUrl, title + ".png");
    return;
  }
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], title + ".png", { type: "image/png" });
    await navigator.share({ title, files: [file] });
  } catch {
    downloadImage(dataUrl, title + ".png");
  }
}
