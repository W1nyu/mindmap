"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { assessmentModules } from "@/data/modules";
import type { ModuleResults } from "@/lib/integration";
import type { MindMapBranch } from "@/lib/mind-map";
import { buildTerrain, TERRAIN_LEVELS } from "@/lib/terrain";

const WIDTH = 1080;
const HEIGHT = 1350;
const MAP_W = 920;
const MAP_H = Math.round((MAP_W * 620) / 1000);
const MAP_X = 80;
const MAP_Y = 270;
const moduleColor = { reaction: "#7a5ec4", defense: "#2f8a62", traits: "#b8678f", attachment: "#3f86a6" } as const;

function fontStack(kind: "display" | "body") {
  const style = getComputedStyle(document.documentElement);
  const value = style.getPropertyValue(kind === "display" ? "--font-hahmlet" : "--font-plex").trim();
  return `${value ? `${value}, ` : ""}"Malgun Gothic", "Apple SD Gothic Neo", sans-serif`;
}

function wrap(context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const char of text) {
    if (context.measureText(line + char).width > maxWidth && line) {
      lines.push(line);
      line = char.trimStart();
    } else line += char;
  }
  return line ? [...lines, line] : lines;
}

/** 지형도 포스터를 이미지로 그립니다. 점수와 결과 문구만 쓰고, 응답이나 기록 원문은 넣지 않습니다. */
function drawSummary(results: ModuleResults, branches: readonly MindMapBranch[], example: boolean): HTMLCanvasElement {
  const display = fontStack("display");
  const body = fontStack("body");
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext("2d")!;
  context.fillStyle = "#f5f4f8";
  context.fillRect(0, 0, WIDTH, HEIGHT);

  context.fillStyle = "#4b3f8f";
  context.font = `600 26px ${body}`;
  context.fillText("SelfMap", 80, 104);
  context.fillStyle = "#1f1d2b";
  context.font = `600 62px ${display}`;
  context.fillText(example ? "샘플 마음 지형도" : "나의 마음 지형도", 80, 186);
  const today = new Date();
  context.fillStyle = "#5f5c72";
  context.font = `400 26px ${body}`;
  context.fillText(`${today.getFullYear()}. ${today.getMonth() + 1}. ${today.getDate()}.`, 80, 232);

  // 지형도
  const model = buildTerrain(results, 1000, 620);
  const scale = MAP_W / 1000;
  context.save();
  context.beginPath();
  context.roundRect(MAP_X, MAP_Y, MAP_W, MAP_H, 28);
  context.fillStyle = "#f0eef7";
  context.fill();
  context.clip();
  context.translate(MAP_X, MAP_Y);
  context.scale(scale, scale);
  model.contours.forEach((contour) => {
    const index = TERRAIN_LEVELS.indexOf(contour.level as (typeof TERRAIN_LEVELS)[number]);
    context.strokeStyle = index >= TERRAIN_LEVELS.length - 4 ? "#4b3f8f" : "#8f86c4";
    context.globalAlpha = 0.45 + (index / TERRAIN_LEVELS.length) * 0.55;
    context.lineWidth = index % 2 === 1 ? 1.8 : 1.1;
    context.stroke(new Path2D(contour.d));
  });
  context.globalAlpha = 1;
  for (const peak of model.peaks) {
    const x = peak.x * 1000;
    const y = peak.y * 620;
    context.fillStyle = moduleColor[peak.module];
    context.beginPath();
    context.moveTo(x, y - 10);
    context.lineTo(x + 9, y + 6);
    context.lineTo(x - 9, y + 6);
    context.closePath();
    context.fill();
    context.textAlign = "center";
    context.lineJoin = "round";
    context.lineWidth = 6;
    context.strokeStyle = "#f0eef7";
    context.font = `700 17px ${body}`;
    context.strokeText(peak.label, x, y - 18);
    context.fillStyle = "#1f1d2b";
    context.fillText(peak.label, x, y - 18);
    context.font = `600 15px ${body}`;
    context.strokeText(String(peak.score), x, y + 26);
    context.fillStyle = "#5f5c72";
    context.fillText(String(peak.score), x, y + 26);
  }
  context.restore();
  context.textAlign = "left";

  // 모듈 요약 2×2
  const cardW = (WIDTH - 160 - 24) / 2;
  const cardH = 150;
  branches.forEach((branch, index) => {
    const x = 80 + (index % 2) * (cardW + 24);
    const y = MAP_Y + MAP_H + 30 + Math.floor(index / 2) * (cardH + 20);
    context.fillStyle = branch.completed ? "#ffffff" : "#eceaf3";
    context.beginPath();
    context.roundRect(x, y, cardW, cardH, 20);
    context.fill();
    context.fillStyle = branch.completed ? moduleColor[branch.module] : "#8c89a0";
    context.beginPath();
    context.arc(x + 32, y + 38, 8, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#1f1d2b";
    context.font = `700 26px ${body}`;
    context.fillText(assessmentModules[branch.module].title, x + 52, y + 47);
    context.font = `400 21px ${body}`;
    context.fillStyle = branch.completed ? "#464359" : "#8c89a0";
    const lines = branch.completed ? branch.leaves.map((leaf) => `${leaf.label} · ${leaf.detail}`) : ["아직 응답하지 않았어요"];
    lines.slice(0, 3).forEach((line, lineIndex) => context.fillText(wrap(context, line, cardW - 72)[0], x + 52, y + 84 + lineIndex * 28));
  });

  context.fillStyle = "#5f5c72";
  context.font = `400 20px ${body}`;
  const footer = "봉우리 높이는 응답에서 그 경향이 드러난 정도이며 좋고 나쁨이 아닙니다. 진단이나 고정된 성격 유형이 아니며, 모든 점수는 고정된 계산식으로 만들어졌어요.";
  wrap(context, footer, WIDTH - 160).forEach((line, index) => context.fillText(line, 80, HEIGHT - 72 + index * 28));
  return canvas;
}

export function SummaryImageButton({ results, branches, example }: { results: ModuleResults; branches: readonly MindMapBranch[]; example: boolean }) {
  const [status, setStatus] = useState("");
  function save() {
    try {
      const canvas = drawSummary(results, branches, example);
      canvas.toBlob((blob) => {
        if (!blob) return setStatus("이미지를 만들지 못했어요.");
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `selfmap-terrain-${new Date().toISOString().slice(0, 10)}.png`;
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setStatus("지형도 이미지를 저장했어요. 이미지는 이 기기에서만 만들어졌어요.");
      }, "image/png");
    } catch {
      setStatus("이 브라우저에서는 이미지를 만들 수 없어요. 인쇄 기능을 이용해 주세요.");
    }
  }
  return <>
    <button type="button" className="button button-secondary" onClick={save}><Icon name="download" size={17} /> 지형도 이미지 저장</button>
    <button type="button" className="button button-secondary" onClick={() => window.print()}><Icon name="book" size={17} /> 인쇄 · PDF</button>
    {status && <span className="saved-note" role="status">{status}</span>}
  </>;
}
