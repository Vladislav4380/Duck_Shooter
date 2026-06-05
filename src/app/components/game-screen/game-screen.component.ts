import {
  Component, OnInit, OnDestroy, AfterViewInit,
  ElementRef, ViewChild, Output, EventEmitter, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { GameService, GameState, Duck, HitEffect } from '../../services/game.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-game-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-screen.component.html',
  styleUrls: ['./game-screen.component.scss']
})
export class GameScreenComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() gameEnd = new EventEmitter<void>();
  @ViewChild('gameCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  gameState: GameState | null = null;
  private sub!: Subscription;
  private ctx!: CanvasRenderingContext2D;
  private renderFrameId: number | null = null;
  private resizeHandler = () => this.resizeCanvas();
  private gameEndTimeoutId: number | null = null;
  private gameEndEmitted = false;

  // Loaded images
  private bgImg = new Image();
  private duckImgs: Record<string, HTMLImageElement> = {};
  private hitImg = new Image();
  private imagesLoaded = 0;
  private readonly totalImages = 5;
  private readonly duckFrameCount = 4;
  private readonly duckFrameDuration = 120;

  // Audio
  private readonly shotSoundUrl = 'assets/shotgun.mp3';
  private readonly shotSoundDuration = 0.62;
  private shotAudio = new Audio(this.shotSoundUrl);
  private audioUnlocked = false;
  private shotAudioPool: HTMLAudioElement[] = [];
  private shotAudioIndex = 0;
  private shotStopTimers = new WeakMap<HTMLAudioElement, number>();
  private audioContext: AudioContext | null = null;
  private shotBuffer: AudioBuffer | null = null;
  private shotBufferPromise: Promise<void> | null = null;

  constructor(
    private gameService: GameService,
    private langService: LanguageService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.sub = this.gameService.gameState$.subscribe(state => {
      this.gameState = state;
      if (state.gameOver && !this.gameEndEmitted) {
        this.gameEndEmitted = true;
        this.gameEndTimeoutId = window.setTimeout(() => {
          this.ngZone.run(() => this.gameEnd.emit());
        }, 900);
      }
    });
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeHandler);

    this.loadImages().then(() => {
      this.ngZone.runOutsideAngular(() => {
        this.gameService.startGame();
        this.renderLoop();
      });
    });
    this.preloadShotSound();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    if (this.renderFrameId) cancelAnimationFrame(this.renderFrameId);
    if (this.gameEndTimeoutId) window.clearTimeout(this.gameEndTimeoutId);
    window.removeEventListener('resize', this.resizeHandler);
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.gameService.setCanvasSize(canvas.width, canvas.height);
  }

  private loadImages(): Promise<void> {
    return new Promise(resolve => {
      let loaded = 0;
      const done = () => { loaded++; if (loaded >= this.totalImages) resolve(); };

      this.bgImg.src = 'assets/bg_game.png';
      this.bgImg.onload = done; this.bgImg.onerror = done;

      ['normal', 'fast', 'golden'].forEach(t => {
        const img = new Image();
        img.src = `assets/duck_${t}_sheet.png`;
        img.onload = done; img.onerror = done;
        this.duckImgs[t] = img;
      });

      this.hitImg.src = 'assets/hit_effect.png';
      this.hitImg.onload = done; this.hitImg.onerror = done;
    });
  }

  private renderLoop(): void {
    this.draw();
    this.renderFrameId = requestAnimationFrame(() => this.renderLoop());
  }

  private draw(): void {
    if (!this.ctx || !this.gameState) return;
    const canvas = this.canvasRef.nativeElement;
    const ctx = this.ctx;
    const w = canvas.width;
    const h = canvas.height;

    // Background
    if (this.bgImg.complete && this.bgImg.naturalWidth > 0) {
      ctx.drawImage(this.bgImg, 0, 0, w, h);
    } else {
      const sky = ctx.createLinearGradient(0, 0, 0, h * 0.65);
      sky.addColorStop(0, '#5BC8F5');
      sky.addColorStop(1, '#A8E6CF');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);
      const grass = ctx.createLinearGradient(0, h * 0.65, 0, h);
      grass.addColorStop(0, '#56C02B');
      grass.addColorStop(1, '#3A8A1E');
      ctx.fillStyle = grass;
      ctx.fillRect(0, h * 0.65, w, h * 0.35);
    }

    // Ducks
    this.gameState.ducks.forEach(d => this.drawDuck(ctx, d));

    // Hit effects
    this.gameState.hitEffects.forEach(fx => this.drawHitEffect(ctx, fx));

    // HUD
    this.drawHUD(ctx, w, h);
  }

  private drawDuck(ctx: CanvasRenderingContext2D, duck: Duck): void {
    ctx.save();
    ctx.globalAlpha = duck.opacity;

    const img = this.duckImgs[duck.type];
    const cx = duck.x + duck.width / 2;
    const cy = duck.y + duck.height / 2;

    ctx.translate(cx, cy);
    if (duck.flipX) ctx.scale(-1, 1);

    if (duck.hit) {
      const elapsed = performance.now() - duck.hitTime;
      const t = elapsed / 450;
      ctx.rotate(t * Math.PI * 2);
      ctx.scale(1 - t * 0.8, 1 - t * 0.8);
    }

    if (img && img.complete && img.naturalWidth > 0) {
      const frameWidth = img.naturalWidth / this.duckFrameCount;
      const frameHeight = img.naturalHeight;
      const frameIndex = Math.floor((performance.now() - duck.spawnTime) / this.duckFrameDuration) % this.duckFrameCount;

      ctx.drawImage(
        img,
        frameIndex * frameWidth,
        0,
        frameWidth,
        frameHeight,
        -duck.width / 2,
        -duck.height / 2,
        duck.width,
        duck.height
      );
    } else {
      // Fallback colored rectangle with type indicator
      const colors: Record<string, string> = { normal: '#8B4513', fast: '#1E90FF', golden: '#FFD700' };
      ctx.fillStyle = colors[duck.type] || '#888';
      ctx.beginPath();
      ctx.ellipse(0, 0, duck.width / 2, duck.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = `${duck.height * 0.7}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🦆', 0, 0);
    }

    ctx.restore();
  }

  private drawHitEffect(ctx: CanvasRenderingContext2D, fx: HitEffect): void {
    ctx.save();
    ctx.globalAlpha = fx.opacity;
    ctx.translate(fx.x, fx.y);

    if (this.hitImg.complete && this.hitImg.naturalWidth > 0) {
      const s = 80 * fx.scale;
      ctx.drawImage(this.hitImg, -s / 2, -s / 2, s, s);
    }

    // Points label floating up
    const elapsed = performance.now() - fx.startTime;
    const yOffset = -(elapsed / fx.duration) * 60;

    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.fillStyle = fx.points >= 50 ? '#FFD700' : fx.points >= 25 ? '#FF6B00' : '#FFFFFF';
    const label = `+${fx.points}`;
    ctx.strokeText(label, 0, yOffset - 40);
    ctx.fillText(label, 0, yOffset - 40);

    ctx.restore();
  }

  private drawHUD(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    if (!this.gameState) return;
    const t = this.gameState.timeLeft;
    const compact = w < 560 || h < 360;
    const top = compact ? 8 : 12;
    const gap = compact ? 6 : 10;
    const pillHeight = compact ? 34 : 42;
    const fontSize = compact ? 15 : 18;
    const timerFontSize = compact ? 18 : 22;

    ctx.save();
    ctx.textBaseline = 'middle';

    ctx.font = `bold ${fontSize}px Arial`;
    const scoreText = `${this.translate('score')}: ${this.gameState.score}`;
    const hitText = `${this.gameState.hits}/${this.gameState.misses}`;
    const scoreWidth = Math.min(Math.max(ctx.measureText(scoreText).width + 24, 96), w * 0.34);
    const hitWidth = compact ? 70 : 88;

    const timerText = `${t}s`;
    ctx.font = `900 ${timerFontSize}px Arial`;
    const timerWidth = Math.min(Math.max(ctx.measureText(timerText).width + 34, compact ? 74 : 92), w * 0.28);

    this.drawHudPill(ctx, gap, top, scoreWidth, pillHeight, 'rgba(0, 0, 0, 0.38)', scoreText, '#FFD45A', fontSize);
    this.drawHudPill(ctx, (w - timerWidth) / 2, top, timerWidth, pillHeight, t <= 10 ? 'rgba(90, 0, 0, 0.62)' : 'rgba(0, 0, 0, 0.42)', timerText, t <= 10 ? '#FFEC5C' : '#FFFFFF', timerFontSize);
    this.drawHudPill(ctx, w - hitWidth - gap, top, hitWidth, pillHeight, 'rgba(0, 0, 0, 0.38)', hitText, '#FFFFFF', fontSize);

    ctx.restore();
    return;

    // Top HUD bar
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.roundRect(10, 10, w - 20, 62, 14);
    ctx.fill();

    ctx.textBaseline = 'middle';

    // Score
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'left';
    ctx.fillText(`🎯 ${this.gameState!.score}`, 22, 41);

    // Timer (center)
    ctx.textAlign = 'center';
    if (t <= 10) {
      ctx.fillStyle = t % 2 === 0 ? '#FF4444' : '#FFD700';
      ctx.font = 'bold 28px Arial';
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px Arial';
    }
    ctx.fillText(`⏱ ${t}s`, w / 2, 41);

    // Hits / Misses
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'right';
    ctx.fillText(`✅ ${this.gameState!.hits}  ❌ ${this.gameState!.misses}`, w - 22, 41);

    ctx.restore();
  }

  private drawHudPill(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    background: string,
    text: string,
    color: string,
    fontSize: number
  ): void {
    ctx.save();
    ctx.fillStyle = background;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.26)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, height / 2);
    ctx.fill();
    ctx.stroke();

    ctx.font = `900 ${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.48)';
    ctx.fillStyle = color;
    ctx.strokeText(text, x + width / 2, y + height / 2);
    ctx.fillText(text, x + width / 2, y + height / 2);
    ctx.restore();
  }

  onCanvasClick(event: MouseEvent | TouchEvent): void {
    //event.preventDefault();
    this.unlockAudio();
    event.preventDefault();
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX: number, clientY: number;
    if (event instanceof TouchEvent) {
      if (!event.changedTouches.length) return;
      clientX = event.changedTouches[0].clientX;
      clientY = event.changedTouches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    const canvasX = (clientX - rect.left) * scaleX;
    const canvasY = (clientY - rect.top) * scaleY;

    this.ngZone.run(() => {
      const pts = this.gameService.shoot(canvasX, canvasY);
      this.playShotSound();
    });
  }

  private playShotSound(): void {
    if (this.shotBuffer) {
      try {
        const context = this.getAudioContext();
        if (!context) {
          this.playHtmlShotSound();
          return;
        }

        if (context.state === 'running') {
          this.playBufferedShotSound(context);
          return;
        }

        context.resume()
          .then(() => this.playBufferedShotSound(context))
          .catch(() => this.playHtmlShotSound());
        return;
      } catch {
        this.playHtmlShotSound();
        return;
      }
    }

    this.playHtmlShotSound();
  }

  private playBufferedShotSound(context: AudioContext): void {
    if (!this.shotBuffer) return;

    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = this.shotBuffer;
    gain.gain.value = 0.75;
    source.connect(gain);
    gain.connect(context.destination);
    source.start(0, 0, Math.min(this.shotSoundDuration, this.shotBuffer.duration));
  }

  private playHtmlShotSound(): void {
    try {
      const shot = this.shotAudioPool[this.shotAudioIndex] || this.shotAudio;
      this.shotAudioIndex = (this.shotAudioIndex + 1) % Math.max(this.shotAudioPool.length, 1);
      const activeTimer = this.shotStopTimers.get(shot);
      if (activeTimer) window.clearTimeout(activeTimer);

      shot.volume = 0.75;
      shot.currentTime = 0;
      shot.play().catch(() => {});
      const stopTimer = window.setTimeout(() => {
        shot.pause();
        shot.currentTime = 0;
      }, this.shotSoundDuration * 1000);
      this.shotStopTimers.set(shot, stopTimer);
    } catch { /* ignore */ }
  }

  private preloadShotSound(): void {
    this.shotAudio.preload = 'auto';
    this.shotAudio.volume = 0.75;
    this.shotAudio.load();
    this.shotAudioPool = Array.from({ length: 4 }, () => {
      const audio = new Audio(this.shotSoundUrl);
      audio.preload = 'auto';
      audio.volume = 0.75;
      audio.load();
      return audio;
    });

    if (this.shotBufferPromise) return;

    this.shotBufferPromise = fetch(this.shotSoundUrl)
      .then(response => response.arrayBuffer())
      .then(data => {
        const context = this.getAudioContext();
        return context?.decodeAudioData(data);
      })
      .then(buffer => {
        if (buffer) this.shotBuffer = buffer;
      })
      .catch(() => {
        this.shotBuffer = null;
      });
  }

  private getAudioContext(): AudioContext | null {
    if (this.audioContext) return this.audioContext;

    const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextCtor) return null;

    this.audioContext = new AudioContextCtor();
    return this.audioContext;
  }

  translate(key: string): string {
    return this.langService.translate(key);
  }

  private unlockAudio(): void {
  if (this.audioUnlocked) {
    return;
  }

  try {
    const context = this.getAudioContext();

    if (context) {
      void context.resume();
    }

    const audio = this.shotAudio;
    audio.volume = 0.01;

    void audio.play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 0.75;
        this.audioUnlocked = true;
      })
      .catch(() => {
        audio.volume = 0.75;
      });
  } catch {
    // ignore
  }
}
}
