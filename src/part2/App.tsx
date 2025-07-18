import React, { useState, useRef, useEffect, useCallback } from 'react';

import type { Rect, ConnectionPoint, Size} from '../part1';
import { dataConverter, getClosestPointOnRectPerimeter} from '../part1';
import {ControlsSidebar} from "./ControlSidebar.tsx";
import {areRectsOverlapping, getAngleForEdge} from "../part1/ValidChecker.ts";

export default function App() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [rects, setRects] = useState<Rect[]>([
        { position: { x: 150, y: 200 }, size: { width: 120, height: 80 } },
        { position: { x: 600, y: 450 }, size: { width: 150, height: 100 } },
    ]);
    const [cPoints, setCPoints] = useState<ConnectionPoint[]>([
        { point: { x: 210, y: 200 }, angle: 0 },
        { point: { x: 525, y: 450 }, angle: 180 },
    ]);

    const draggedItemRef = useRef<{
        type: 'rect' | 'cPoint';
        index: number;
        offsetX?: number;
        offsetY?: number;
    } | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = Math.min(window.innerWidth - 40, 1000);
        canvas.height = Math.min(window.innerHeight - 120, 700);

        const isOverlapping = areRectsOverlapping(rects[0], rects[1]);

        const drawGrid = () => {
            const step = 50;
            ctx.strokeStyle = '#374151';
            ctx.lineWidth = 0.5;
            ctx.font = '10px sans-serif';
            ctx.fillStyle = '#6b7280';

            for (let x = 0; x < canvas.width; x += step) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
                ctx.fillText(x.toString(), x + 2, 10);
            }
            for (let y = 0; y < canvas.height; y += step) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
                if (y > 0) {
                    ctx.fillText(y.toString(), 2, y - 2);
                }
            }
        };

        const drawRect = (rect: Rect, isOverlapping: boolean) => {
            ctx.strokeStyle = isOverlapping ? '#f87171' : '#9ca3af';
            ctx.lineWidth = 2;
            ctx.fillStyle = isOverlapping ? 'rgba(252, 165, 165, 0.7)' : 'rgba(173, 216, 230, 0.8)';
            ctx.fillRect(rect.position.x - rect.size.width / 2, rect.position.y - rect.size.height / 2, rect.size.width, rect.size.height);
            ctx.strokeRect(rect.position.x - rect.size.width / 2, rect.position.y - rect.size.height / 2, rect.size.width, rect.size.height);
        };

        const drawPath = (points: {x: number, y: number}[], isOverlapping: boolean) => {
            if (points.length < 2) return;
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
            ctx.strokeStyle = isOverlapping ? '#f87171' : '#34d399';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
        };
        const drawConnectionHandle = (cPoint: ConnectionPoint) => {
            ctx.beginPath();
            ctx.arc(cPoint.point.x, cPoint.point.y, 8, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(52, 211, 153, 0.5)';
            ctx.fill();
            ctx.strokeStyle = '#34d399';
            ctx.lineWidth = 2;
            ctx.stroke();
        };

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid();

        const path = dataConverter(rects[0], rects[1], cPoints[0], cPoints[1]);

        drawRect(rects[0], isOverlapping);
        drawRect(rects[1], isOverlapping);
        drawPath(path, isOverlapping);
        drawConnectionHandle(cPoints[0]);
        drawConnectionHandle(cPoints[1]);

    }, [rects, cPoints]);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const mousePos = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
        canvas.style.cursor = 'default';

        for (let i = 0; i < cPoints.length; i++) {
            if (Math.hypot(mousePos.x - cPoints[i].point.x, mousePos.y - cPoints[i].point.y) < 10) {
                draggedItemRef.current = { type: 'cPoint', index: i };
                canvas.style.cursor = 'grab';
                return;
            }
        }

        for (let i = 0; i < rects.length; i++) {
            const rect = rects[i];
            if (mousePos.x > rect.position.x - rect.size.width / 2 && mousePos.x < rect.position.x + rect.size.width / 2 &&
                mousePos.y > rect.position.y - rect.size.height / 2 && mousePos.y < rect.position.y + rect.size.height / 2) {
                draggedItemRef.current = {
                    type: 'rect',
                    index: i,
                    offsetX: mousePos.x - rect.position.x,
                    offsetY: mousePos.y - rect.position.y
                };
                canvas.style.cursor = 'grabbing';
                return;
            }
        }
    }, [cPoints, rects]);

    const handleRectSizeChange = useCallback((index: number, newSize: Size) => {
        const newRects = rects.map((rect, i) => i === index ? { ...rect, size: newSize } : rect);
        setRects(newRects);

        const updatedRect = newRects[index];
        const currentCPoint = cPoints[index];

        const { point: snappedPoint, edge } = getClosestPointOnRectPerimeter(currentCPoint.point, updatedRect);

        setCPoints(prevCPoints => prevCPoints.map((cp, i) =>
            i === index ? { point: snappedPoint, angle: getAngleForEdge(edge) } : cp
        ));
    }, [rects, cPoints]);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!draggedItemRef.current) return;
        const mousePos = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
        const draggedItem = draggedItemRef.current;

        if (draggedItem.type === 'rect') {
            const rectIndex = draggedItem.index;
            const oldRect = rects[rectIndex];
            const newPosX = mousePos.x - draggedItem.offsetX!;
            const newPosY = mousePos.y - draggedItem.offsetY!;

            const dx = newPosX - oldRect.position.x;
            const dy = newPosY - oldRect.position.y;

            setRects((prevRects: Rect[]) => prevRects.map((r: Rect, i: number) => i === rectIndex ? { ...r, position: { x: newPosX, y: newPosY } } : r));
            setCPoints((prevCPoints: ConnectionPoint[]) => prevCPoints.map((cp: ConnectionPoint, i: number) =>
                i === rectIndex ? { ...cp, point: { x: cp.point.x + dx, y: cp.point.y + dy } } : cp
            ));

        } else if (draggedItem.type === 'cPoint') {
            const cPointIndex = draggedItem.index;
            const targetRect = rects[cPointIndex];

            const { point: snappedPoint, edge } = getClosestPointOnRectPerimeter(mousePos, targetRect);

            if (edge) {
                setCPoints((prev: ConnectionPoint[]) => prev.map((cp: ConnectionPoint, i: number) =>
                    i === cPointIndex ? { point: snappedPoint, angle: getAngleForEdge(edge) } : cp
                ));
            } else {
                setCPoints((prev: ConnectionPoint[]) => prev.map((cp: ConnectionPoint, i: number) =>
                    i === cPointIndex ? { ...cp, point: mousePos } : cp
                ));
            }
        }
    }, [rects, cPoints]);

    const handleMouseUp = useCallback(() => {
        draggedItemRef.current = null;
        if (canvasRef.current) {
            canvasRef.current.style.cursor = 'default';
        }
    }, []);

    return (
        <div className="flex flex-row w-full bg-gray-900 text-gray-200 font-sans">
            <ControlsSidebar rects={rects} onSizeChange={handleRectSizeChange}/>

            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-4 text-sm text-center">
                    <p>Перетаскивайте прямоугольники или точки соединения (кружки) для пересчета пути.</p>
                </div>

                <canvas
                    ref={canvasRef}
                    className="bg-gray-800 rounded-lg border border-gray-700 flex-1 h-screen"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                />
            </div>
        </div>
    );
}