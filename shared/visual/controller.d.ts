// SPDX-License-Identifier: AGPL-3.0-only
export function createMoodController(
  root: HTMLElement,
  initialPosition: number,
): {
  setPosition(next: number, immediate?: boolean): void;
  destroy(): void;
};
