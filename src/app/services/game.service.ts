import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type DuckType = 'normal' | 'fast' | 'golden';

export interface Duck {
  id: string;
  type: DuckType;
  x: number;
  y: number;
  width: number;
  height: number;
  speedX: number;
  speedY: number;
  flipX: boolean;
  wobble: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  spawnTime: number;
  exitTurnY: number | null;
  hasTurnedToExit: boolean;
  hit: boolean;
  hitTime: number;
  opacity: number;
  points: number;
  scale: number;
}

export interface HitEffect {
  id: string;
  x: number;
  y: number;
  startTime: number;
  duration: number;
  points: number;
  opacity: number;
  scale: number;
}

export interface GameState {
  score: number;
  hits: number;
  misses: number;
  timeLeft: number;
  isRunning: boolean;
  gameOver: boolean;
  ducks: Duck[];
  hitEffects: HitEffect[];
}

@Injectable({ providedIn: 'root' })
export class GameService {
  readonly GAME_DURATION = 60;
  private readonly DUCK_SPAWN_INTERVAL = 900;
  private readonly MAX_DUCKS = 8;
  private readonly MIN_DUCK_SCALE = 0.45;
  private readonly MAX_DUCK_SCALE = 1.3;
  private readonly MIN_SCORING_SPEED = 80;
  private readonly MAX_SCORING_SPEED = 310;
  private readonly BASE_POINTS: Record<DuckType, number> = {
    normal: 10,
    fast: 25,
    golden: 50
  };

  private duckIdCounter = 0;
  private effectIdCounter = 0;
  private spawnTimer: ReturnType<typeof setInterval> | null = null;
  private gameTimer: ReturnType<typeof setInterval> | null = null;
  private animationFrameId: number | null = null;
  private lastFrameTime = 0;

  private state: GameState = this.freshState();

  gameState$ = new BehaviorSubject<GameState>(this.freshState());

  canvasWidth = 0;
  canvasHeight = 0;

  private freshState(): GameState {
    return {
      score: 0,
      hits: 0,
      misses: 0,
      timeLeft: this.GAME_DURATION,
      isRunning: false,
      gameOver: false,
      ducks: [],
      hitEffects: []
    };
  }

  setCanvasSize(w: number, h: number): void {
    this.canvasWidth = w;
    this.canvasHeight = h;
  }

  startGame(): void {
    this.clearTimers();
    this.state = this.freshState();
    this.state.isRunning = true;
    this.emit();

    // Countdown timer
    this.gameTimer = setInterval(() => {
      this.state.timeLeft--;
      if (this.state.timeLeft <= 0) {
        this.state.timeLeft = 0;
        this.endGame();
      }
      this.emit();
    }, 1000);

    // Duck spawner
    this.spawnTimer = setInterval(() => {
      if (this.state.isRunning && this.state.ducks.filter(d => !d.hit).length < this.MAX_DUCKS) {
        this.spawnDuck();
      }
    }, this.DUCK_SPAWN_INTERVAL);

    // Spawn first duck immediately
    setTimeout(() => this.spawnDuck(), 200);
    setTimeout(() => this.spawnDuck(), 600);

    // Start animation loop
    this.lastFrameTime = performance.now();
    this.animationFrameId = requestAnimationFrame(t => this.animationLoop(t));
  }

  private animationLoop(timestamp: number): void {
    const delta = Math.min(timestamp - this.lastFrameTime, 100); // cap at 100ms
    this.lastFrameTime = timestamp;

    if (this.state.isRunning || this.state.ducks.length > 0 || this.state.hitEffects.length > 0) {
      this.updateDucks(delta, timestamp);
      this.updateHitEffects(timestamp);
      this.emit();
    }

    if (this.state.isRunning || this.state.ducks.length > 0 || this.state.hitEffects.length > 0) {
      this.animationFrameId = requestAnimationFrame(t => this.animationLoop(t));
    }
  }

  private updateDucks(delta: number, now: number): void {
    const dt = delta / 1000;

    this.state.ducks = this.state.ducks.filter(duck => {
      if (duck.hit) {
        const elapsed = now - duck.hitTime;
        duck.opacity = Math.max(0, 1 - elapsed / 450);
        return elapsed < 450;
      }

      // Move duck
      duck.x += duck.speedX * dt;
      duck.y += duck.speedY * dt;

      // Sine-wave wobble on vertical axis
      duck.wobble += duck.wobbleSpeed * dt;
      duck.y += Math.sin(duck.wobble) * duck.wobbleAmp * dt;

      this.turnTopDuckTowardExit(duck);

      // Face direction of travel
      duck.flipX = duck.speedX < 0;

      // Remove only after the duck has actually flown away from the screen.
      if (duck.x < -duck.width * 2 || duck.x > this.canvasWidth + duck.width * 2) return false;
      if (duck.y < -duck.height * 3 || duck.y > this.canvasHeight + duck.height * 2) return false;

      return true;
    });
  }

  private turnTopDuckTowardExit(duck: Duck): void {
    if (duck.exitTurnY === null || duck.hasTurnedToExit || duck.y < duck.exitTurnY) return;

    const currentSpeed = Math.hypot(duck.speedX, duck.speedY);
    const exitDirection = duck.x + duck.width / 2 < this.canvasWidth / 2 ? 1 : -1;
    const exitSpeed = Math.max(currentSpeed, this.MIN_SCORING_SPEED);

    duck.speedX = exitDirection * exitSpeed;
    duck.speedY = (Math.random() - 0.5) * exitSpeed * 0.22;
    duck.hasTurnedToExit = true;
  }

  private updateHitEffects(now: number): void {
    this.state.hitEffects = this.state.hitEffects.filter(e => {
      const elapsed = now - e.startTime;
      e.opacity = Math.max(0, 1 - elapsed / e.duration);
      e.scale = 0.5 + (elapsed / e.duration) * 1.0;
      return elapsed < e.duration;
    });
  }

  private spawnDuck(): void {
    if (!this.canvasWidth || !this.canvasHeight) return;

    const rand = Math.random();
    let type: DuckType;
    if (rand < 0.6) type = 'normal';
    else if (rand < 0.85) type = 'fast';
    else type = 'golden';

    // Varied sizes: small ducks are harder to click, big ones easier
    const scale = 0.45 + Math.random() * 0.85; // 0.45 – 1.3
    const baseW = 110;
    const baseH = 75;
    const w = baseW * scale;
    const h = baseH * scale;

    const baseSpeed = type === 'fast' ? 200 + Math.random() * 90
      : type === 'golden' ? 130 + Math.random() * 70
      : 85 + Math.random() * 65;

    const edge = Math.floor(Math.random() * 4);
    let x: number, y: number, speedX: number, speedY: number;
    let exitTurnY: number | null = null;

    switch (edge) {
      case 0: // left → right
        x = -w;
        y = 20 + Math.random() * (this.canvasHeight * 0.72);
        speedX = baseSpeed;
        speedY = (Math.random() - 0.5) * baseSpeed * 0.35;
        break;
      case 1: // right → left
        x = this.canvasWidth + w;
        y = 20 + Math.random() * (this.canvasHeight * 0.72);
        speedX = -baseSpeed;
        speedY = (Math.random() - 0.5) * baseSpeed * 0.35;
        break;
      case 2: // top → down
        x = Math.random() * (this.canvasWidth - w);
        y = -h;
        speedX = (Math.random() - 0.5) * baseSpeed * 0.7;
        speedY = baseSpeed * 0.55;
        exitTurnY = this.canvasHeight * (0.42 + Math.random() * 0.18);
        break;
      default: // bottom → up (rare)
        x = Math.random() * (this.canvasWidth - w);
        y = this.canvasHeight * 0.85;
        speedX = (Math.random() - 0.5) * baseSpeed;
        speedY = -baseSpeed * 0.65;
        break;
    }

    const points = this.calculateDuckPoints(type, scale, speedX, speedY);

    this.state.ducks.push({
      id: `duck_${++this.duckIdCounter}`,
      type, x, y,
      width: w, height: h,
      speedX, speedY,
      flipX: speedX < 0,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 3 + Math.random() * 2.5,
      wobbleAmp: 18 + Math.random() * 28,
      spawnTime: performance.now(),
      exitTurnY,
      hasTurnedToExit: false,
      hit: false, hitTime: 0, opacity: 1,
      points,
      scale
    });
  }

  private calculateDuckPoints(type: DuckType, scale: number, speedX: number, speedY: number): number {
    const basePoints = this.BASE_POINTS[type];
    const sizeDifficulty = this.clamp(
      (this.MAX_DUCK_SCALE - scale) / (this.MAX_DUCK_SCALE - this.MIN_DUCK_SCALE),
      0,
      1
    );
    const speed = Math.hypot(speedX, speedY);
    const speedDifficulty = this.clamp(
      (speed - this.MIN_SCORING_SPEED) / (this.MAX_SCORING_SPEED - this.MIN_SCORING_SPEED),
      0,
      1
    );

    const sizeMultiplier = 0.8 + sizeDifficulty * 0.7;
    const speedMultiplier = 0.9 + speedDifficulty * 0.5;
    const points = basePoints * sizeMultiplier * speedMultiplier;

    return Math.max(5, Math.round(points / 5) * 5);
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }

  /**
   * Process a click/tap at canvas coordinates.
   * Returns points scored (0 = miss).
   */
  shoot(canvasX: number, canvasY: number): number {
    if (!this.state.isRunning) return 0;

    // Iterate in reverse so topmost duck is hit first
    for (let i = this.state.ducks.length - 1; i >= 0; i--) {
      const duck = this.state.ducks[i];
      if (duck.hit) continue;

      // Slightly generous hit box
      const pad = 0.1;
      const hx = duck.x + duck.width * pad;
      const hy = duck.y + duck.height * pad;
      const hw = duck.width * (1 - pad * 2);
      const hh = duck.height * (1 - pad * 2);

      if (canvasX >= hx && canvasX <= hx + hw && canvasY >= hy && canvasY <= hy + hh) {
        duck.hit = true;
        duck.hitTime = performance.now();
        this.state.score += duck.points;
        this.state.hits++;

        this.state.hitEffects.push({
          id: `fx_${++this.effectIdCounter}`,
          x: duck.x + duck.width / 2,
          y: duck.y + duck.height / 2,
          startTime: performance.now(),
          duration: 750,
          points: duck.points,
          opacity: 1,
          scale: 0.5
        });

        this.saveBestScore();
        this.emit();
        return duck.points;
      }
    }

    // Miss
    this.state.misses++;
    this.emit();
    return 0;
  }

  private endGame(): void {
    this.state.isRunning = false;
    this.state.gameOver = true;
    if (this.spawnTimer) { clearInterval(this.spawnTimer); this.spawnTimer = null; }
    if (this.gameTimer) { clearInterval(this.gameTimer); this.gameTimer = null; }
    this.saveBestScore();
    this.emit();
  }

  private clearTimers(): void {
    if (this.spawnTimer) { clearInterval(this.spawnTimer); this.spawnTimer = null; }
    if (this.gameTimer) { clearInterval(this.gameTimer); this.gameTimer = null; }
    if (this.animationFrameId) { cancelAnimationFrame(this.animationFrameId); this.animationFrameId = null; }
  }

  resetGame(): void {
    this.clearTimers();
    this.state = this.freshState();
    this.emit();
  }

  private emit(): void {
    this.gameState$.next({
      ...this.state,
      ducks: [...this.state.ducks],
      hitEffects: [...this.state.hitEffects]
    });
  }

  getBestScore(): number {
    return parseInt(localStorage.getItem('duck_best_score') || '0', 10);
  }

  private saveBestScore(): void {
    if (this.state.score > this.getBestScore()) {
      localStorage.setItem('duck_best_score', String(this.state.score));
    }
  }

  getAccuracy(): number {
    const total = this.state.hits + this.state.misses;
    return total === 0 ? 0 : Math.round((this.state.hits / total) * 100);
  }

  getState(): GameState {
    return { ...this.state, ducks: [...this.state.ducks], hitEffects: [...this.state.hitEffects] };
  }
}
