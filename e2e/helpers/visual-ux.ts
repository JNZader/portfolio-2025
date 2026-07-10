import { expect, type Locator } from '@playwright/test';

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export async function expectMinimumTarget(locator: Locator, size = 44) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  expect(box?.width ?? 0).toBeGreaterThanOrEqual(size);
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(size);
}

export function rectanglesOverlap(first: Rectangle, second: Rectangle) {
  return !(
    first.x + first.width <= second.x ||
    second.x + second.width <= first.x ||
    first.y + first.height <= second.y ||
    second.y + second.height <= first.y
  );
}
