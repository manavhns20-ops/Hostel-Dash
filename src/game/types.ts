/**
 * Hostel Dash: The 8 AM Nightmare - Types & Interfaces
 */

export type GameStatus = 'TITLE' | 'COUNTDOWN' | 'PLAYING' | 'PAUSED' | 'VICTORY' | 'GAMEOVER';

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  grounded: boolean;
  facing: 'right' | 'left';
  state: 'idle' | 'running' | 'jumping' | 'falling';
  animFrame: number;
  animTimer: number;
  invulnerableTimer: number;
  squashStretch: { scaleX: number; scaleY: number };
  coyoteTimer: number;
  jumpBufferTimer: number;
  speedBoostTimer: number;
  lives: number;
  hasIdCard: boolean;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'solid' | 'one-way' | 'desk' | 'shelf' | 'bench' | 'step';
  color?: string;
}

export type CollectibleType = 'id_card' | 'coffee' | 'assignment' | 'mess_coupon';

export interface Collectible {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: CollectibleType;
  collected: boolean;
  bobOffset: number;
  title: string;
  points: number;
}

export type HazardType = 'shoes' | 'books' | 'puddle' | 'dustbin' | 'football' | 'warden';

export interface Hazard {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: HazardType;
  vx?: number;
  minX?: number;
  maxX?: number;
  direction?: 1 | -1;
  damage: number;
  timePenalty: number; // in seconds subtracted from clock
  message: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  shape?: 'square' | 'sparkle' | 'circle' | 'note';
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
  life: number;
  maxLife: number;
}

export interface GameStats {
  score: number;
  timeRemaining: number; // 90.0 down to 0
  totalTime: number; // 90.0s
  lives: number;
  hasIdCard: boolean;
  collectiblesCount: {
    coffee: number;
    assignments: number;
    coupons: number;
  };
  distanceCovered: number; // in %
  currentZone: 'Hostel Room' | 'Hostel Corridor' | 'Campus Courtyard' | 'Academic Block';
  currentObjective: string;
  rank?: 'S' | 'A' | 'B' | 'C' | 'F';
  gameoverReason?: string;
}

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  justJumped: boolean;
  pause: boolean;
}
