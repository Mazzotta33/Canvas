import { describe, it, expect } from 'vitest';
import type { Rect, ConnectionPoint } from '../part1';
import { dataConverter} from '../part1';
import {areRectsOverlapping, determineEdge, isAngleValid, isPointInRect} from "../part1/ValidChecker.ts";

const testRect: Rect = { position: { x: 100, y: 100 }, size: { width: 100, height: 50 } };

describe('isPointOnRectBoundary (isPointInRect)', () => {
    it('должен возвращать true, если точка находится на вертикальной грани', () => {
        const pointOnRightEdge = { x: 150, y: 100 };
        expect(isPointInRect(pointOnRightEdge, testRect)).toBe(true);
    });

    it('должен возвращать true, если точка находится на горизонтальной грани', () => {
        const pointOnTopEdge = { x: 100, y: 75 };
        expect(isPointInRect(pointOnTopEdge, testRect)).toBe(true);
    });

    it('должен возвращать false, если точка находится внутри прямоугольника, но не на грани', () => {
        const pointInside = { x: 100, y: 100 };
        expect(isPointInRect(pointInside, testRect)).toBe(false);
    });

    it('должен возвращать false, если точка находится снаружи прямоугольника', () => {
        const pointOutside = { x: 200, y: 200 };
        expect(isPointInRect(pointOutside, testRect)).toBe(false);
    });
});

describe('determineEdge', () => {
    it('должен корректно определять верхнюю грань (top)', () => {
        const point = { x: 100, y: 75 };
        expect(determineEdge(point, testRect)).toBe('top');
    });

    it('должен корректно определять правую грань (right)', () => {
        const point = { x: 150, y: 100 };
        expect(determineEdge(point, testRect)).toBe('right');
    });

    it('должен возвращать null, если точка не находится на грани', () => {
        const point = { x: 101, y: 101 };
        expect(determineEdge(point, testRect)).toBe(null);
    });
});

describe('isAngleValid', () => {
    it('должен возвращать true для корректного угла на грани', () => {
        const cPoint: ConnectionPoint = { point: { x: 150, y: 100 }, angle: 0 };
        expect(isAngleValid(cPoint, testRect)).toBe(true);
    });

    it('должен возвращать false для некорректного угла на грани', () => {
        const cPoint: ConnectionPoint = { point: { x: 150, y: 100 }, angle: 90 };
        expect(isAngleValid(cPoint, testRect)).toBe(false);
    });

    it('должен возвращать false, если точка не находится на грани', () => {
        const cPoint: ConnectionPoint = { point: { x: 101, y: 101 }, angle: 0 };
        expect(isAngleValid(cPoint, testRect)).toBe(false);
    });
});

describe('dataConverter', () => {

    it('должен возвращать корректный путь для стандартного расположения', () => {
        const rect1: Rect = { position: { x: 100, y: 100 }, size: { width: 100, height: 50 } };
        const rect2: Rect = { position: { x: 400, y: 300 }, size: { width: 100, height: 50 } };

        const cPoint1: ConnectionPoint = { point: { x: 150, y: 100 }, angle: 0 };
        const cPoint2: ConnectionPoint = { point: { x: 350, y: 300 }, angle: 180 };

        const path = dataConverter(rect1, rect2, cPoint1, cPoint2);

        expect(path.length).toBeGreaterThan(2);
        expect(path[0]).toEqual(cPoint1.point);
        expect(path[path.length - 1]).toEqual(cPoint2.point);
    });

    it('должен возвращать прямую линию, если прямоугольники пересекаются', () => {
        const rect1: Rect = { position: { x: 100, y: 100 }, size: { width: 100, height: 100 } };
        const rect2: Rect = { position: { x: 150, y: 150 }, size: { width: 100, height: 100 } };

        const cPoint1: ConnectionPoint = { point: { x: 150, y: 100 }, angle: 0 };
        const cPoint2: ConnectionPoint = { point: { x: 100, y: 150 }, angle: 180 };

        const path = dataConverter(rect1, rect2, cPoint1, cPoint2);

        expect(path.length).toBe(2);
        expect(path).toEqual([cPoint1.point, cPoint2.point]);
    });

    it('должен возвращать пустой массив, если путь не найден', () => {
        const rect1: Rect = { position: { x: 100, y: 100 }, size: { width: 50, height: 200 } };
        const rect2: Rect = { position: { x: 100, y: 400 }, size: { width: 50, height: 200 } };

        const cPoint1: ConnectionPoint = { point: { x: 100, y: 200 }, angle: 270 };
        const cPoint2: ConnectionPoint = { point: { x: 100, y: 300 }, angle: 90 };

        const path = dataConverter(rect1, rect2, cPoint1, cPoint2);

        expect(path).toEqual([cPoint1.point, cPoint2.point]);
    });
});

describe('areRectsOverlapping', () => {
    it('должен возвращать true для пересекающихся прямоугольников', () => {
        const rect1: Rect = { position: { x: 100, y: 100 }, size: { width: 100, height: 100 } };
        const rect2: Rect = { position: { x: 150, y: 150 }, size: { width: 100, height: 100 } };
        expect(areRectsOverlapping(rect1, rect2)).toBe(true);
    });

    it('должен возвращать true для касающихся прямоугольников', () => {
        const rect1: Rect = { position: { x: 100, y: 100 }, size: { width: 100, height: 100 } };
        const rect2: Rect = { position: { x: 200, y: 100 }, size: { width: 100, height: 100 } };
        expect(areRectsOverlapping(rect1, rect2)).toBe(true);
    });

    it('должен возвращать false для непересекающихся прямоугольников', () => {
        const rect1: Rect = { position: { x: 100, y: 100 }, size: { width: 50, height: 50 } };
        const rect2: Rect = { position: { x: 300, y: 300 }, size: { width: 50, height: 50 } };
        expect(areRectsOverlapping(rect1, rect2)).toBe(false);
    });
});