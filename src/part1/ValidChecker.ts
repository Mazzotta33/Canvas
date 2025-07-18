import type {ConnectionPoint, Edge, NonNullEdge, Point, Rect} from "./index.ts";

export const areRectsOverlapping = (rect1: Rect, rect2: Rect): boolean => {
    const r1Left = rect1.position.x - rect1.size.width / 2;
    const r1Right = rect1.position.x + rect1.size.width / 2;
    const r1Top = rect1.position.y - rect1.size.height / 2;
    const r1Bottom = rect1.position.y + rect1.size.height / 2;

    const r2Left = rect2.position.x - rect2.size.width / 2;
    const r2Right = rect2.position.x + rect2.size.width / 2;
    const r2Top = rect2.position.y - rect2.size.height / 2;
    const r2Bottom = rect2.position.y + rect2.size.height / 2;

    if (r1Right < r2Left || r1Left > r2Right || r1Bottom < r2Top || r1Top > r2Bottom) {
        return false;
    }

    return true;
};

export const isPointInRect = (point: Point, rect: Rect, epsilon: number = 1e-6): boolean => {
    const RW = rect.size.width / 2;
    const RH = rect.size.height / 2;
    const dx = Math.abs(point.x - rect.position.x);
    const dy = Math.abs(point.y - rect.position.y);

    const isOnVerticalEdges = Math.abs(dx - RW) < epsilon && dy <= RH + epsilon;
    const isOnHorizontalEdges = Math.abs(dy - RH) < epsilon && dx <= RW + epsilon;

    return isOnVerticalEdges || isOnHorizontalEdges;
};

export const determineEdge = (point: Point, rect: Rect, epsilon: number = 1e-6): Edge => {
    const hw = rect.size.width / 2;
    const hh = rect.size.height / 2;

    const rectLeft = rect.position.x - hw;
    const rectRight = rect.position.x + hw;
    const rectTop = rect.position.y - hh;
    const rectBottom = rect.position.y + hh;

    if (Math.abs(point.y - rectTop) < epsilon && point.x >= rectLeft && point.x <= rectRight) return 'top';
    if (Math.abs(point.y - rectBottom) < epsilon && point.x >= rectLeft && point.x <= rectRight) return 'bottom';
    if (Math.abs(point.x - rectRight) < epsilon && point.y >= rectTop && point.y <= rectBottom) return 'right';
    if (Math.abs(point.x - rectLeft) < epsilon && point.y >= rectTop && point.y <= rectBottom) return 'left';

    return null;
};

export const isAngleValid = (cPoint: ConnectionPoint, rect: Rect): boolean => {
    const edge = determineEdge(cPoint.point, rect);
    if (!edge) return false;
    const validAngles: Record<NonNullEdge, number> = { top: 90, bottom: 270, right: 0, left: 180 };
    return Math.abs(cPoint.angle - validAngles[edge]) < 1;
};

export const getAngleForEdge = (edge: Edge): number => {
    switch (edge) {
        case 'top': return 90;
        case 'bottom': return 270;
        case 'right': return 0;
        case 'left': return 180;
        default: return 0;
    }
};