/**
 * Core Game Engine for Hostel Dash: The 8 AM Nightmare
 * 60fps delta-time loop, responsive physics, camera, sound, and state machine.
 */

import { Player, Platform, Collectible, Hazard, Particle, FloatingText, GameStatus, GameStats, InputState } from './types';
import { LEVEL_WIDTH, LEVEL_HEIGHT, GROUND_Y, FINISH_LINE_X, createInitialPlatforms, createInitialCollectibles, createInitialHazards } from './levels';
import { GameRenderer } from './renderer';
import { sound } from './audio';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private renderer: GameRenderer;

  // Viewport & Scale
  public readonly logicalWidth = 960;
  public readonly logicalHeight = 540;

  // State
  private status: GameStatus = 'TITLE';
  private animFrameId: number | null = null;
  private lastTime: number = 0;
  private gameTime: number = 0;
  private countdownTimer: number = 3.0; // 3..2..1.. GO!

  // Camera & FX
  private cameraX: number = 0;
  private screenShake: number = 0;
  private hitstopTimer: number = 0;

  // Clock & Gameplay
  public readonly totalGameTime = 90.0; // 90 seconds real-time = 5 in-game minutes (7:55 AM -> 8:00 AM)
  private timeRemaining: number = 90.0;
  private score: number = 0;
  private warningBeepTimer: number = 0;

  // Entities
  private player: Player;
  private platforms: Platform[] = [];
  private collectibles: Collectible[] = [];
  private hazards: Hazard[] = [];
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];

  // Input
  private input: InputState = {
    left: false,
    right: false,
    jump: false,
    justJumped: false,
    pause: false,
  };

  // Callbacks
  private onStatsChange?: (stats: GameStats) => void;
  private onStatusChange?: (status: GameStatus) => void;
  private onToast?: (msg: string) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D canvas context');
    this.ctx = ctx;
    this.renderer = new GameRenderer(ctx, this.logicalWidth, this.logicalHeight);

    this.player = this.createDefaultPlayer();
    this.resetLevel();

    this.bindEvents();
  }

  public setCallbacks(callbacks: {
    onStatsChange?: (stats: GameStats) => void;
    onStatusChange?: (status: GameStatus) => void;
    onToast?: (msg: string) => void;
  }) {
    this.onStatsChange = callbacks.onStatsChange;
    this.onStatusChange = callbacks.onStatusChange;
    this.onToast = callbacks.onToast;
  }

  private createDefaultPlayer(): Player {
    return {
      x: 80,
      y: GROUND_Y - 56,
      vx: 0,
      vy: 0,
      width: 28,
      height: 52,
      grounded: true,
      facing: 'right',
      state: 'idle',
      animFrame: 0,
      animTimer: 0,
      invulnerableTimer: 0,
      squashStretch: { scaleX: 1, scaleY: 1 },
      coyoteTimer: 0,
      jumpBufferTimer: 0,
      speedBoostTimer: 0,
      lives: 3,
      hasIdCard: false,
    };
  }

  public resetLevel() {
    this.player = this.createDefaultPlayer();
    this.platforms = createInitialPlatforms();
    this.collectibles = createInitialCollectibles();
    this.hazards = createInitialHazards();
    this.particles = [];
    this.floatingTexts = [];
    this.cameraX = 0;
    this.screenShake = 0;
    this.hitstopTimer = 0;
    this.timeRemaining = this.totalGameTime;
    this.score = 0;
    this.gameTime = 0;
    this.countdownTimer = 3.0;
    this.warningBeepTimer = 0;
    this.emitStats();
  }

  // --- Input Handlers ---
  private bindEvents() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
  }

  public destroy() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    // Sound Unlock
    sound.unlock();

    // Prevent scrolling for game keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }

    if (e.code === 'KeyM') {
      sound.toggleMute();
      return;
    }

    if (e.code === 'Escape') {
      if (this.status === 'PLAYING') {
        this.pause();
      } else if (this.status === 'PAUSED') {
        this.resume();
      }
      return;
    }

    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      this.input.left = true;
    }
    if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      this.input.right = true;
    }
    if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
      if (!this.input.jump) {
        this.input.justJumped = true;
        this.player.jumpBufferTimer = 0.12; // 120ms jump buffer
      }
      this.input.jump = true;
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      this.input.left = false;
    }
    if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      this.input.right = false;
    }
    if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
      this.input.jump = false;
      // Variable jump height: cut vertical rise when key released
      if (this.player.vy < -3) {
        this.player.vy *= 0.5;
      }
    }
  };

  private handleBlur = () => {
    this.input.left = false;
    this.input.right = false;
    this.input.jump = false;
    this.input.justJumped = false;
  };

  // Virtual touch control input methods for mobile/tablet
  public setVirtualInput(action: 'left' | 'right' | 'jump', pressed: boolean) {
    sound.unlock();
    if (action === 'left') this.input.left = pressed;
    if (action === 'right') this.input.right = pressed;
    if (action === 'jump') {
      if (pressed && !this.input.jump) {
        this.input.justJumped = true;
        this.player.jumpBufferTimer = 0.12;
      }
      this.input.jump = pressed;
      if (!pressed && this.player.vy < -3) {
        this.player.vy *= 0.5;
      }
    }
  }

  // --- State Transitions ---
  public startCountdown() {
    sound.unlock();
    this.resetLevel();
    this.status = 'COUNTDOWN';
    this.countdownTimer = 3.0;
    this.onStatusChange?.(this.status);
    this.lastTime = performance.now();
    if (!this.animFrameId) {
      this.animFrameId = requestAnimationFrame(this.loop);
    }
  }

  public pause() {
    if (this.status === 'PLAYING') {
      this.status = 'PAUSED';
      this.onStatusChange?.(this.status);
    }
  }

  public resume() {
    if (this.status === 'PAUSED') {
      this.status = 'PLAYING';
      this.lastTime = performance.now();
      this.onStatusChange?.(this.status);
    }
  }

  public restart() {
    this.startCountdown();
  }

  public setStatus(s: GameStatus) {
    this.status = s;
    this.onStatusChange?.(s);
  }

  // --- Main Animation Loop ---
  public loop = (timestamp: number) => {
    if (!this.lastTime) this.lastTime = timestamp;
    const rawDt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    // Clamp dt to prevent massive simulation jumps on tab switch
    const dt = Math.min(rawDt, 0.05);

    if (this.status === 'COUNTDOWN') {
      this.countdownTimer -= dt;
      if (this.countdownTimer <= 0) {
        this.status = 'PLAYING';
        this.onStatusChange?.(this.status);
      }
    } else if (this.status === 'PLAYING') {
      // Hitstop delay on heavy impacts
      if (this.hitstopTimer > 0) {
        this.hitstopTimer -= dt;
      } else {
        this.update(dt);
      }
    } else if (this.status === 'TITLE') {
      // Idle animation on title screen preview
      this.gameTime += dt;
    }

    // Render always
    this.render();

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  // --- Physics & Game State Update ---
  private update(dt: number) {
    this.gameTime += dt;
    const p = this.player;

    // 1. Clock Countdown
    this.timeRemaining -= dt;
    if (this.timeRemaining <= 15 && this.timeRemaining > 0) {
      this.warningBeepTimer += dt;
      if (this.warningBeepTimer >= 1.0) {
        this.warningBeepTimer = 0;
        sound.playWarning();
      }
    }

    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      this.triggerGameOver('8:00 AM has arrived! Professor Sharma has locked the door. Attendance: 0% recorded.');
      return;
    }

    // 2. Timers
    if (p.invulnerableTimer > 0) p.invulnerableTimer -= dt;
    if (p.jumpBufferTimer > 0) p.jumpBufferTimer -= dt;
    if (p.speedBoostTimer > 0) p.speedBoostTimer -= dt;
    if (this.screenShake > 0) this.screenShake = Math.max(0, this.screenShake - dt * 3);

    // Squash & Stretch decay toward 1.0
    p.squashStretch.scaleX += (1 - p.squashStretch.scaleX) * dt * 10;
    p.squashStretch.scaleY += (1 - p.squashStretch.scaleY) * dt * 10;

    // 3. Horizontal Movement
    const maxSpeed = p.speedBoostTimer > 0 ? 8.2 : 5.4;
    const accel = p.grounded ? 28 : 16;
    const friction = p.grounded ? 22 : 8;

    let targetVx = 0;
    if (this.input.left) {
      targetVx = -maxSpeed;
      p.facing = 'left';
    } else if (this.input.right) {
      targetVx = maxSpeed;
      p.facing = 'right';
    }

    if (targetVx !== 0) {
      p.vx += (targetVx - p.vx) * Math.min(1, accel * dt);
      p.state = 'running';
      p.animTimer += dt;
      // Spawn dust puff on floor
      if (p.grounded && Math.random() < 0.25) {
        this.spawnDust(p.x + p.width / 2, p.y + p.height);
      }
    } else {
      p.vx += (0 - p.vx) * Math.min(1, friction * dt);
      if (Math.abs(p.vx) < 0.1) p.vx = 0;
      p.state = 'idle';
      p.animTimer = 0;
    }

    // 4. Coyote Time & Jump Buffering
    if (p.grounded) {
      p.coyoteTimer = 0.1; // 100ms coyote time
    } else {
      p.coyoteTimer -= dt;
    }

    const canJump = p.grounded || p.coyoteTimer > 0;
    const wantsJump = this.input.justJumped || p.jumpBufferTimer > 0;

    if (wantsJump && canJump) {
      p.vy = -12.6; // High, crisp jump impulse
      p.grounded = false;
      p.coyoteTimer = 0;
      p.jumpBufferTimer = 0;
      this.input.justJumped = false;

      // Squash and stretch: stretch vertically
      p.squashStretch.scaleX = 0.82;
      p.squashStretch.scaleY = 1.25;

      sound.playJump();
      this.spawnDust(p.x + p.width / 2, p.y + p.height);
    }
    this.input.justJumped = false;

    // 5. Gravity
    const gravity = 28;
    p.vy += gravity * dt;
    if (p.vy > 14) p.vy = 14; // terminal velocity

    // Update state based on vertical movement
    if (!p.grounded) {
      p.state = p.vy < 0 ? 'jumping' : 'falling';
    }

    // 6. Apply Movement & Collisions
    // Horizontal Move
    p.x += p.vx;
    this.resolveHorizontalCollisions(p);

    // Clamp inside level bounds
    if (p.x < 10) {
      p.x = 10;
      p.vx = 0;
    }
    if (p.x > LEVEL_WIDTH - p.width - 20) {
      p.x = LEVEL_WIDTH - p.width - 20;
    }

    // Vertical Move
    p.y += p.vy;
    p.grounded = false;
    this.resolveVerticalCollisions(p);

    // 7. Update Moving Hazards (Warden, Rolling Football)
    this.updateHazards(dt);

    // 8. Check Collectible Pickups
    this.checkCollectibles();

    // 9. Check Hazard Collisions
    this.checkHazardCollisions();

    // 10. Check Destination / Classroom Entrance
    this.checkClassroomArrival();

    // 11. Update Particles & Floating Text
    this.updateParticles(dt);

    // 12. Camera Tracking
    const targetCameraX = p.x - this.logicalWidth * 0.36;
    const maxCameraX = LEVEL_WIDTH - this.logicalWidth;
    this.cameraX += (Math.max(0, Math.min(maxCameraX, targetCameraX)) - this.cameraX) * Math.min(1, dt * 8);

    // 13. Emit stats to UI
    this.emitStats();
  }

  // --- Collision Resolutions ---
  private resolveHorizontalCollisions(p: Player) {
    this.platforms.forEach((plat) => {
      if (plat.type !== 'solid') return;

      // AABB overlap check
      if (
        p.x < plat.x + plat.width &&
        p.x + p.width > plat.x &&
        p.y < plat.y + plat.height &&
        p.y + p.height > plat.y
      ) {
        if (p.vx > 0) {
          // Moving right
          p.x = plat.x - p.width;
          p.vx = 0;
        } else if (p.vx < 0) {
          // Moving left
          p.x = plat.x + plat.width;
          p.vx = 0;
        }
      }
    });
  }

  private resolveVerticalCollisions(p: Player) {
    this.platforms.forEach((plat) => {
      // Overlap horizontally
      const overlapsX = p.x + p.width > plat.x + 4 && p.x < plat.x + plat.width - 4;

      if (plat.type === 'solid') {
        if (
          overlapsX &&
          p.y < plat.y + plat.height &&
          p.y + p.height > plat.y
        ) {
          if (p.vy > 0) {
            // Landing on top
            p.y = plat.y - p.height;
            p.vy = 0;
            if (!p.grounded) {
              this.onPlayerLand();
            }
            p.grounded = true;
          } else if (p.vy < 0) {
            // Hitting ceiling
            p.y = plat.y + plat.height;
            p.vy = 0;
          }
        }
      } else if (plat.type === 'one-way' || plat.type === 'shelf' || plat.type === 'bench') {
        // One-way platforms: only land if falling from above
        const feetY = p.y + p.height;
        const prevFeetY = feetY - p.vy;

        if (overlapsX && p.vy >= 0 && prevFeetY <= plat.y + 4 && feetY >= plat.y) {
          p.y = plat.y - p.height;
          p.vy = 0;
          if (!p.grounded) {
            this.onPlayerLand();
          }
          p.grounded = true;
        }
      }
    });
  }

  private onPlayerLand() {
    this.player.squashStretch.scaleX = 1.25;
    this.player.squashStretch.scaleY = 0.8;
    sound.playLand();
    this.spawnDust(this.player.x + this.player.width / 2, this.player.y + this.player.height);
  }

  // --- Moving Hazards Update ---
  private updateHazards(dt: number) {
    this.hazards.forEach((h) => {
      if (h.type === 'warden' || h.type === 'football') {
        const speed = h.vx || 1.5;
        const dir = h.direction || 1;
        h.x += speed * dir;

        if (h.maxX && h.x >= h.maxX) {
          h.direction = -1;
          h.x = h.maxX;
        } else if (h.minX && h.x <= h.minX) {
          h.direction = 1;
          h.x = h.minX;
        }
      }
    });
  }

  // --- Collectible Logic ---
  private checkCollectibles() {
    const p = this.player;

    this.collectibles.forEach((c) => {
      if (c.collected) return;

      // Distance check
      if (
        p.x < c.x + c.width &&
        p.x + p.width > c.x &&
        p.y < c.y + c.height &&
        p.y + p.height > c.y
      ) {
        c.collected = true;
        this.score += c.points;

        if (c.type === 'id_card') {
          p.hasIdCard = true;
          sound.playIdCollect();
          this.screenShake = 0.3;
          this.spawnSparkles(c.x + c.width / 2, c.y + c.height / 2, '#facc15', 25);
          this.addFloatingText(c.x, c.y - 10, 'ID CARD ACQUIRED!', '#facc15');
          this.onToast?.('ID CARD ACQUIRED: You are now legally a student!');
        } else if (c.type === 'coffee') {
          p.speedBoostTimer = 4.5; // 4.5 seconds of super speed
          sound.playCoffee();
          this.spawnSparkles(c.x + c.width / 2, c.y + c.height / 2, '#38bdf8', 16);
          this.addFloatingText(c.x, c.y - 10, '+SPEED BOOST!', '#38bdf8');
          this.onToast?.('ESPRESSO OVERDRIVE: Speed boosted for 4.5s!');
        } else if (c.type === 'assignment') {
          sound.playCollect();
          this.spawnSparkles(c.x + c.width / 2, c.y + c.height / 2, '#4ade80', 14);
          this.addFloatingText(c.x, c.y - 10, `+${c.points} SUBMITTED!`, '#4ade80');
          this.onToast?.('Assignment picked up: "SUBMISSION DEADLINE: YESTERDAY"');
        } else if (c.type === 'mess_coupon') {
          sound.playCollect();
          this.spawnSparkles(c.x + c.width / 2, c.y + c.height / 2, '#fbbf24', 12);
          this.addFloatingText(c.x, c.y - 10, `+${c.points} SAMOSA!`, '#fbbf24');
        }
      }
    });
  }

  // --- Hazard Collision Logic ---
  private checkHazardCollisions() {
    const p = this.player;
    if (p.invulnerableTimer > 0) return;

    this.hazards.forEach((h) => {
      // Overlap check
      if (
        p.x < h.x + h.width &&
        p.x + p.width > h.x &&
        p.y < h.y + h.height &&
        p.y + p.height > h.y
      ) {
        // Hazard impact triggered!
        p.invulnerableTimer = 1.6; // 1.6s grace period
        this.screenShake = 0.5;
        this.hitstopTimer = 0.05; // 50ms hitstop
        p.vx = p.facing === 'right' ? -4 : 4; // Knockback

        // Time penalty applied to clock!
        if (h.timePenalty > 0) {
          this.timeRemaining = Math.max(0, this.timeRemaining - h.timePenalty);
          this.addFloatingText(p.x, p.y - 20, `-${h.timePenalty}s!`, '#ef4444');
        }

        // Damage to Lives
        if (h.damage > 0) {
          p.lives -= h.damage;
          sound.playWarden();
          this.spawnSparkles(p.x + p.width / 2, p.y + p.height / 2, '#dc2626', 20);
          this.onToast?.(h.message);

          if (p.lives <= 0) {
            this.triggerGameOver('Warden Verma confiscated your hostel freedom! Attendance: 0%.');
            return;
          }
        } else {
          sound.playHit();
          this.spawnSparkles(p.x + p.width / 2, p.y + p.height / 2, '#f97316', 12);
          this.onToast?.(h.message);
        }
      }
    });
  }

  // --- Check Classroom Arrival ---
  private checkClassroomArrival() {
    const p = this.player;

    if (p.x >= FINISH_LINE_X) {
      if (p.hasIdCard && this.timeRemaining > 0) {
        // VICTORY ACHIEVED!
        this.triggerVictory();
      } else if (!p.hasIdCard) {
        // Rejection scene: no ID card!
        p.x = FINISH_LINE_X - 120; // push back
        p.vx = -5;
        this.screenShake = 0.4;
        sound.playWarden();
        this.addFloatingText(p.x, p.y - 25, 'NO ID CARD! 0% ENTRY!', '#ef4444');
        this.onToast?.('PROFESSOR SHARMA: "Where is your ID card?! You cannot enter without it! Run back!"');
      }
    }
  }

  private triggerVictory() {
    this.status = 'VICTORY';
    sound.playVictory();
    this.spawnConfetti();

    // Time bonus: 25 points per remaining second
    const timeBonus = Math.floor(this.timeRemaining * 25);
    this.score += timeBonus + 500;

    this.onStatusChange?.(this.status);
    this.emitStats();
  }

  private triggerGameOver(reason: string) {
    this.status = 'GAMEOVER';
    sound.playGameOver();
    this.onStatusChange?.(this.status);
    this.emitStats(reason);
  }

  // --- Particles & FX ---
  private spawnDust(x: number, y: number) {
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 12,
        y: y - 2,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 1.5,
        size: 2 + Math.random() * 2,
        color: '#94a3b8',
        alpha: 0.6,
        decay: 1.5,
      });
    }
  }

  private spawnSparkles(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 3,
        color,
        alpha: 1.0,
        decay: 1.2,
        shape: 'sparkle',
      });
    }
  }

  private spawnConfetti() {
    const colors = ['#f43f5e', '#38bdf8', '#fbbf24', '#4ade80', '#c084fc'];
    for (let i = 0; i < 80; i++) {
      this.particles.push({
        x: FINISH_LINE_X + (Math.random() - 0.5) * 400,
        y: 200 + Math.random() * 100,
        vx: (Math.random() - 0.5) * 4,
        vy: -2 - Math.random() * 4,
        size: 4 + Math.random() * 4,
        color: colors[i % colors.length],
        alpha: 1.0,
        decay: 0.4,
      });
    }
  }

  private addFloatingText(x: number, y: number, text: string, color: string) {
    this.floatingTexts.push({
      id: Math.random().toString(),
      x,
      y,
      text,
      color,
      alpha: 1.0,
      vy: -1.2,
      life: 0,
      maxLife: 1.2,
    });
  }

  private updateParticles(dt: number) {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay * dt;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.life += dt;
      ft.alpha = 1 - ft.life / ft.maxLife;
      if (ft.life >= ft.maxLife) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  // --- Stats Computation ---
  private emitStats(gameoverReason?: string) {
    const p = this.player;

    // Calculate Zone
    let zone: GameStats['currentZone'] = 'Hostel Room';
    let objective = 'Find your ID Card on the shelf & head out the door!';

    if (p.x < 1100) {
      zone = 'Hostel Room';
      objective = p.hasIdCard ? 'Escape Room 101 into the corridor!' : 'Collect your Student ID Card!';
    } else if (p.x < 2300) {
      zone = 'Hostel Corridor';
      objective = 'Dodge puddles & evade Warden Verma! Do not get caught!';
    } else if (p.x < 3800) {
      zone = 'Campus Courtyard';
      objective = 'Sprint through the courtyard! Watch out for the rolling football!';
    } else {
      zone = 'Academic Block';
      objective = 'Climb the steps to Lecture Hall 101 before 8:00 AM!';
    }

    // Count collected types
    let coffeeCount = 0;
    let assignCount = 0;
    let couponCount = 0;
    this.collectibles.forEach((c) => {
      if (c.collected) {
        if (c.type === 'coffee') coffeeCount++;
        if (c.type === 'assignment') assignCount++;
        if (c.type === 'mess_coupon') couponCount++;
      }
    });

    // Distance progress %
    const distanceCovered = Math.min(100, Math.floor((p.x / FINISH_LINE_X) * 100));

    // Performance Rank
    let rank: GameStats['rank'] = 'C';
    if (this.score >= 2300 && this.timeRemaining >= 35) rank = 'S';
    else if (this.score >= 1700) rank = 'A';
    else if (this.score >= 1100) rank = 'B';
    else if (this.score < 500) rank = 'F';

    this.onStatsChange?.({
      score: this.score,
      timeRemaining: this.timeRemaining,
      totalTime: this.totalGameTime,
      lives: p.lives,
      hasIdCard: p.hasIdCard,
      collectiblesCount: {
        coffee: coffeeCount,
        assignments: assignCount,
        coupons: couponCount,
      },
      distanceCovered,
      currentZone: zone,
      currentObjective: objective,
      rank,
      gameoverReason,
    });
  }

  // --- Render Call ---
  public render() {
    this.renderer.render(
      this.player,
      this.platforms,
      this.collectibles,
      this.hazards,
      this.particles,
      this.floatingTexts,
      this.cameraX,
      this.gameTime,
      this.totalGameTime,
      this.screenShake
    );
  }
}
