/** Public surface of the imperative engine modules. */
export interface EngineHandle {
  /** Stop all animation loops, remove listeners and injected SVG/canvas layers. */
  destroy(): void;
}

export interface DiamondOptions {
  /** Low-power mode: lower pixel ratio, fewer particles. */
  lite: boolean;
  /** Touch device: hint copy changes, drag-to-orbit is disabled. */
  touch: boolean;
  /** Called when the hands snatch the token back. */
  onBlock?: () => void;
  /** Called when a visitor flings the token out of frame. */
  onSteal?: () => void;
}

export interface DiamondHandle {
  destroy(): void;
}
