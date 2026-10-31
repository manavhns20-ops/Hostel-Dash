/**
 * Procedural Pixel-Art Canvas Renderer for Hostel Dash: The 8 AM Nightmare
 */

import { Player, Platform, Collectible, Hazard, Particle, FloatingText } from './types';
import { LEVEL_WIDTH, LEVEL_HEIGHT, GROUND_Y, FINISH_LINE_X } from './levels';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public render(
    player: Player,
    platforms: Platform[],
    collectibles: Collectible[],
    hazards: Hazard[],
    particles: Particle[],
    floatingTexts: FloatingText[],
    cameraX: number,
    gameTime: number,
    totalGameTime: number,
    screenShake: number
  ) {
    const ctx = this.ctx;

    ctx.save();

    // Screen Shake effect
    if (screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * screenShake * 8;
      const shakeY = (Math.random() - 0.5) * screenShake * 8;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Draw Multi-Layer Parallax Background
    this.drawBackground(cameraX, gameTime);

    // 2. World Coordinate Transformation
    ctx.save();
    ctx.translate(-cameraX, 0);

    // 3. Draw Level Specific Background Scenery
    this.drawLevelScenery(cameraX, gameTime);

    // 4. Draw Platforms & Ground
    this.drawPlatforms(platforms);

    // 5. Draw Collectibles
    this.drawCollectibles(collectibles, gameTime);

    // 6. Draw Hazards & NPCs
    this.drawHazards(hazards, gameTime);

    // 7. Draw Destination (Professor Sharma & Classroom Door)
    this.drawDestination(gameTime, player.hasIdCard);

    // 8. Draw Player
    this.drawPlayer(player, gameTime);

    // 9. Draw Particle Effects
    this.drawParticles(particles);

    // 10. Draw Floating Texts
    this.drawFloatingTexts(floatingTexts);

    ctx.restore(); // Restore world translation
    ctx.restore(); // Restore screen shake
  }

  // --- 1. Multi-Layer Parallax Background ---
  private drawBackground(cameraX: number, gameTime: number) {
    const ctx = this.ctx;

    // Morning Sunrise Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    skyGrad.addColorStop(0, '#1e1b4b'); // Deep pre-dawn indigo
    skyGrad.addColorStop(0.35, '#432874'); // Dawn violet
    skyGrad.addColorStop(0.65, '#b45309'); // Warm sunrise amber
    skyGrad.addColorStop(0.85, '#f59e0b'); // Golden horizon glow
    skyGrad.addColorStop(1, '#fed7aa'); // Soft morning peach
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Distant Sun peaking over horizon
    const sunX = this.width * 0.7 - cameraX * 0.02;
    const sunY = 220;
    ctx.fillStyle = 'rgba(254, 240, 138, 0.35)';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(253, 224, 71, 0.85)';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 26, 0, Math.PI * 2);
    ctx.fill();

    // Layer 1: Distant Drifting Morning Clouds (Speed: 0.05)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    const cloudOffsets = [
      { x: 60, y: 50, w: 90, h: 22 },
      { x: 260, y: 75, w: 120, h: 26 },
      { x: 500, y: 40, w: 100, h: 24 },
      { x: 740, y: 85, w: 130, h: 28 },
      { x: 1020, y: 60, w: 110, h: 25 },
      { x: 1350, y: 70, w: 140, h: 30 },
    ];
    cloudOffsets.forEach((c) => {
      const px = ((c.x + gameTime * 12 - cameraX * 0.05) % (LEVEL_WIDTH * 0.5) + LEVEL_WIDTH * 0.5) % (LEVEL_WIDTH * 0.5) - 200;
      this.drawPixelCloud(px, c.y, c.w, c.h);
    });

    // Layer 2: Distant Campus Silhouette (Hostel Blocks & Clocktower) (Speed: 0.12)
    ctx.fillStyle = '#2e1065';
    const bgOffset2 = -(cameraX * 0.12) % 600;
    for (let x = bgOffset2 - 100; x < this.width + 200; x += 180) {
      // Silhouette buildings
      ctx.fillRect(x, 260, 70, 190);
      ctx.fillRect(x + 60, 240, 60, 210);
      ctx.fillRect(x + 110, 280, 50, 170);

      // Distant clocktower spire
      ctx.beginPath();
      ctx.moveTo(x + 85, 205);
      ctx.lineTo(x + 95, 240);
      ctx.lineTo(x + 75, 240);
      ctx.fill();

      // Tiny glowing dorm windows
      ctx.fillStyle = 'rgba(254, 240, 138, 0.7)';
      for (let wy = 270; wy < 420; wy += 22) {
        ctx.fillRect(x + 12, wy, 8, 10);
        ctx.fillRect(x + 36, wy, 8, 10);
        ctx.fillRect(x + 80, wy, 8, 10);
      }
      ctx.fillStyle = '#2e1065';
    }

    // Layer 3: Midground Campus Trees & Light Poles (Speed: 0.35)
    const bgOffset3 = -(cameraX * 0.35) % 500;
    for (let tx = bgOffset3 - 80; tx < this.width + 150; tx += 240) {
      // Tree trunk
      ctx.fillStyle = '#3f2214';
      ctx.fillRect(tx + 24, 340, 14, 110);
      // Foliage
      ctx.fillStyle = '#1e3a1e';
      ctx.beginPath();
      ctx.arc(tx + 31, 320, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2d5a27';
      ctx.beginPath();
      ctx.arc(tx + 31, 310, 28, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawPixelCloud(x: number, y: number, w: number, h: number) {
    const ctx = this.ctx;
    ctx.fillRect(x, y + h * 0.4, w, h * 0.6);
    ctx.fillRect(x + w * 0.2, y + h * 0.15, w * 0.6, h * 0.85);
    ctx.fillRect(x + w * 0.35, y, w * 0.35, h);
  }

  // --- 2. Level Scenery & Zone Artwork ---
  private drawLevelScenery(cameraX: number, gameTime: number) {
    const ctx = this.ctx;

    // SECTION A: Hostel Room Interior (x: 0 to 1100)
    if (cameraX < 1400) {
      // Room Wall (warm retro wallpaper)
      ctx.fillStyle = '#3d2817';
      ctx.fillRect(0, 80, 1100, GROUND_Y - 80);

      // Wall Brick / Panel Lines
      ctx.strokeStyle = '#2e1c0c';
      ctx.lineWidth = 2;
      for (let y = 100; y < GROUND_Y; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1100, y);
        ctx.stroke();
      }

      // Ceiling Fan (Spinning!)
      const fanX = 520;
      const fanY = 110;
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(fanX - 4, 80, 8, 30); // pole
      ctx.beginPath();
      ctx.arc(fanX, fanY, 10, 0, Math.PI * 2);
      ctx.fill();

      // Spinning blades
      const fanAngle = gameTime * 15;
      ctx.save();
      ctx.translate(fanX, fanY);
      ctx.rotate(fanAngle);
      ctx.fillStyle = '#4b5563';
      ctx.fillRect(-70, -4, 140, 8);
      ctx.fillRect(-4, -70, 8, 140);
      ctx.restore();

      // Wall Posters
      // Poster 1: "KEEP CALM & SUBMIT"
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(180, 150, 75, 95);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(185, 155, 65, 85);
      ctx.fillStyle = '#991b1b';
      ctx.font = '7px monospace';
      ctx.fillText('KEEP', 202, 175);
      ctx.fillText('CALM', 202, 190);
      ctx.fillText('& PASS', 198, 205);
      ctx.fillText('CSE 8AM', 194, 220);

      // Poster 2: Mess Food Menu / Timetable
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(360, 170, 55, 70);
      ctx.fillStyle = '#854d0e';
      ctx.font = '6px monospace';
      ctx.fillText('MESS MENU', 364, 185);
      ctx.fillText('MON: PAIN', 364, 198);
      ctx.fillText('TUE: REGRET', 364, 211);
      ctx.fillText('8AM QUIZ!', 364, 224);

      // Bed in Hostel Room (x: 30 to 180)
      this.drawHostelBed(gameTime);

      // Study Desk with PC Monitor (x: 420 to 560)
      this.drawStudyDesk(gameTime);

      // Wardrobe (x: 800 to 900)
      this.drawWardrobe();

      // Hostel Room Door (x: 1040 to 1100)
      this.drawHostelDoor();
    }

    // SECTION B: Hostel Corridor (x: 1100 to 2300)
    if (cameraX > 700 && cameraX < 2600) {
      // Corridor Wall (Instituitional mint/yellow)
      ctx.fillStyle = '#232d36';
      ctx.fillRect(1100, 100, 1200, GROUND_Y - 100);

      // Overhead corridor lights
      for (let lx = 1200; lx < 2300; lx += 200) {
        ctx.fillStyle = '#475569';
        ctx.fillRect(lx, 100, 60, 10);
        // Soft light glow
        ctx.fillStyle = 'rgba(254, 240, 138, 0.15)';
        ctx.beginPath();
        ctx.moveTo(lx + 10, 110);
        ctx.lineTo(lx + 50, 110);
        ctx.lineTo(lx + 120, GROUND_Y);
        ctx.lineTo(lx - 60, GROUND_Y);
        ctx.closePath();
        ctx.fill();
      }

      // Corridor Room Doors
      const roomDoors = [
        { x: 1180, num: '102' },
        { x: 1420, num: '103' },
        { x: 1720, num: '104' },
        { x: 2000, num: '105' },
      ];
      roomDoors.forEach((d) => {
        // Door frame
        ctx.fillStyle = '#334155';
        ctx.fillRect(d.x, 240, 75, 210);
        ctx.fillStyle = '#475569';
        ctx.fillRect(d.x + 5, 245, 65, 200);
        // Room Number plate
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(d.x + 22, 260, 30, 16);
        ctx.fillStyle = '#0f172a';
        ctx.font = '8px monospace';
        ctx.fillText(d.num, d.x + 28, 272);
        // Door knob
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(d.x + 14, 350, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Hostel Notice Board
      ctx.fillStyle = '#78350f';
      ctx.fillRect(1530, 180, 140, 90);
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(1536, 186, 128, 78);
      ctx.fillStyle = '#b91c1c';
      ctx.font = '7px monospace';
      ctx.fillText('!! ATTENTION !!', 1555, 202);
      ctx.fillStyle = '#1e293b';
      ctx.font = '6px monospace';
      ctx.fillText('NO SPRINTING IN HALL', 1542, 216);
      ctx.fillText('8:00 AM GATES CLOSE', 1542, 228);
      ctx.fillText('WARDEN PATROL ACTIVE', 1542, 240);

      // Fire Extinguisher
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(1930, 310, 16, 42);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(1934, 300, 8, 10);
    }

    // SECTION B (Cont.): Campus Courtyard (x: 2300 to 3800)
    if (cameraX > 1800 && cameraX < 4200) {
      // Courtyard Fountain
      this.drawCampusFountain(gameTime);

      // Campus Trees
      for (let tx = 2400; tx < 3800; tx += 340) {
        // Lush foreground tree
        ctx.fillStyle = '#451a03';
        ctx.fillRect(tx + 20, 280, 20, 170);
        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.arc(tx + 30, 250, 48, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(tx + 25, 235, 36, 0, Math.PI * 2);
        ctx.fill();
      }

      // Street Lamps
      for (let lx = 2650; lx < 3700; lx += 380) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(lx, 260, 8, 190);
        ctx.fillRect(lx - 12, 250, 32, 10);
        // Glowing bulb
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(lx + 4, 266, 7, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // SECTION C: Academic Block Entrance (x: 3800 to 5200)
    if (cameraX > 3400) {
      // Academic building facade
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(3900, 60, 1300, GROUND_Y - 60);

      // Dept Signboard Banner
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(4100, 90, 480, 55);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.strokeRect(4100, 90, 480, 55);
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 12px "Press Start 2P", monospace';
      ctx.fillText('DEPT OF COMPUTER SCIENCE', 4125, 122);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px monospace';
      ctx.fillText('LECTURE COMPLEX - 8:00 AM STRICT ENTRY', 4180, 138);

      // Grand Classical Pillars
      const pillars = [4080, 4320, 4560, 4800];
      pillars.forEach((px) => {
        // Pillar Base
        ctx.fillStyle = '#64748b';
        ctx.fillRect(px - 10, 345, 48, 30);
        // Column
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(px - 4, 150, 36, 195);
        // Column fluting lines
        ctx.fillStyle = '#64748b';
        ctx.fillRect(px + 4, 150, 4, 195);
        ctx.fillRect(px + 16, 150, 4, 195);
        // Pillar Capital
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(px - 12, 140, 52, 14);
      });
    }
  }

  // Bed & Ringing Alarm Clock
  private drawHostelBed(gameTime: number) {
    const ctx = this.ctx;
    // Wooden headboard & frame
    ctx.fillStyle = '#78350f';
    ctx.fillRect(30, 340, 16, 110);
    ctx.fillRect(46, 400, 134, 50);

    // Mattress & White Sheet
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(46, 385, 130, 20);

    // Tangled Blue Quilt / Blanket
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(80, 380, 96, 25);
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(95, 382, 70, 20);

    // Pillow
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(48, 375, 35, 15);

    // Nightstand table
    ctx.fillStyle = '#451a03';
    ctx.fillRect(185, 395, 45, 55);

    // RINGING ALARM CLOCK!
    const clockShake = Math.sin(gameTime * 35) * 2;
    const cx = 198 + clockShake;
    const cy = 378;

    // Clock Body
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(cx, cy, 22, 18);
    // Twin bells
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(cx + 3, cy, 4, 0, Math.PI * 2);
    ctx.arc(cx + 19, cy, 4, 0, Math.PI * 2);
    ctx.fill();

    // Clock Screen with 7:55
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(cx + 2, cy + 3, 18, 12);
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 6px monospace';
    ctx.fillText('07:55', cx + 3, cy + 12);

    // Sound vibration lines
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx - 3, cy + 9, 6, Math.PI * 0.7, Math.PI * 1.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 25, cy + 9, 6, -Math.PI * 0.3, Math.PI * 0.3);
    ctx.stroke();
  }

  // Study Desk with PC Monitor
  private drawStudyDesk(gameTime: number) {
    const ctx = this.ctx;
    // Desk wood
    ctx.fillStyle = '#5c2b09';
    ctx.fillRect(420, 370, 140, 80);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(415, 365, 150, 12);

    // Desktop PC Monitor
    const mx = 460;
    const my = 300;
    // Stand
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(mx + 22, my + 50, 14, 15);
    ctx.fillRect(mx + 14, my + 63, 30, 4);

    // Monitor screen frame
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(mx, my, 58, 50);
    // Display screen with terminal code!
    ctx.fillStyle = '#022c22';
    ctx.fillRect(mx + 3, my + 3, 52, 44);

    // Glowing green lines of code
    ctx.fillStyle = '#4ade80';
    ctx.font = '5px monospace';
    ctx.fillText('gcc main.c', mx + 5, my + 13);
    ctx.fillStyle = '#f87171';
    ctx.fillText('ERROR: 8AM!', mx + 5, my + 23);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('Late Penalty', mx + 5, my + 33);

    // Animated cursor
    if (Math.floor(gameTime * 2) % 2 === 0) {
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(mx + 5, my + 37, 5, 2);
    }
  }

  // Wardrobe
  private drawWardrobe() {
    const ctx = this.ctx;
    ctx.fillStyle = '#451a03';
    ctx.fillRect(800, 300, 100, 150);
    ctx.strokeStyle = '#2b1002';
    ctx.lineWidth = 2;
    ctx.strokeRect(800, 300, 100, 150);
    ctx.beginPath();
    ctx.moveTo(850, 300);
    ctx.lineTo(850, 450);
    ctx.stroke();

    // Handles
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(844, 370, 4, 16);
    ctx.fillRect(852, 370, 4, 16);
  }

  // Hostel Room Door
  private drawHostelDoor() {
    const ctx = this.ctx;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(1040, 270, 75, 180);
    ctx.fillStyle = '#334155';
    ctx.fillRect(1045, 275, 65, 175);
    // "EXIT ROOM" sign
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(1052, 285, 50, 14);
    ctx.fillStyle = '#ffffff';
    ctx.font = '6px monospace';
    ctx.fillText('ROOM 101', 1056, 295);
    // Golden door knob
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(1054, 360, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Campus Courtyard Fountain
  private drawCampusFountain(gameTime: number) {
    const ctx = this.ctx;
    const fx = 2740;
    const fy = 345;

    // Stone Basin
    ctx.fillStyle = '#475569';
    ctx.fillRect(fx, fy, 170, 105);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(fx + 6, fy + 6, 158, 30); // Water pool

    // Animated water ripples
    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 2;
    const rip = Math.sin(gameTime * 4) * 4;
    ctx.beginPath();
    ctx.ellipse(fx + 85, fy + 18, 50 + rip, 10, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Fountain Pedestal & Water Jet
    ctx.fillStyle = '#64748b';
    ctx.fillRect(fx + 75, fy - 25, 20, 35);

    // Water spray particles
    ctx.fillStyle = 'rgba(186, 230, 253, 0.85)';
    for (let i = 0; i < 6; i++) {
      const sprayY = fy - 25 - ((gameTime * 30 + i * 8) % 28);
      const sprayX = fx + 85 + Math.sin(gameTime * 8 + i) * 12;
      ctx.fillRect(sprayX, sprayY, 3, 3);
    }
  }

  // --- 4. Draw Platforms & Ground ---
  private drawPlatforms(platforms: Platform[]) {
    const ctx = this.ctx;

    platforms.forEach((p) => {
      if (p.type === 'solid') {
        // Solid block with styled top edge
        ctx.fillStyle = p.color || '#334155';
        ctx.fillRect(p.x, p.y, p.width, p.height);

        // Highlight top rim
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(p.x, p.y, p.width, 3);

        // Dark bottom rim
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(p.x, p.y + p.height - 3, p.width, 3);

        // Grass blades on courtyard ground
        if (p.x >= 2300 && p.x < 3950 && p.y === GROUND_Y) {
          ctx.fillStyle = '#4ade80';
          for (let gx = p.x; gx < p.x + p.width; gx += 16) {
            ctx.fillRect(gx, p.y - 4, 3, 4);
            ctx.fillRect(gx + 6, p.y - 6, 3, 6);
          }
        }
      } else if (p.type === 'one-way' || p.type === 'shelf') {
        // Shelf / Ledge platform
        ctx.fillStyle = p.color || '#d97706';
        ctx.fillRect(p.x, p.y, p.width, p.height);
        // Wood grain or metal finish
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(p.x, p.y, p.width, 2);
        // Supports underneath
        ctx.fillStyle = '#451a03';
        ctx.fillRect(p.x + 8, p.y + p.height, 6, 8);
        ctx.fillRect(p.x + p.width - 14, p.y + p.height, 6, 8);
      } else if (p.type === 'bench') {
        // Campus Bench
        ctx.fillStyle = p.color || '#94a3b8';
        ctx.fillRect(p.x, p.y, p.width, 6); // seat
        ctx.fillRect(p.x + 6, p.y - 12, p.width - 12, 6); // backrest
        // Legs
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(p.x + 8, p.y + 6, 6, p.height - 6);
        ctx.fillRect(p.x + p.width - 14, p.y + 6, 6, p.height - 6);
      }
    });
  }

  // --- 5. Draw Collectibles ---
  private drawCollectibles(collectibles: Collectible[], gameTime: number) {
    const ctx = this.ctx;

    collectibles.forEach((c) => {
      if (c.collected) return;

      const bobY = c.y + Math.sin(gameTime * 4 + c.bobOffset) * 4;

      if (c.type === 'id_card') {
        // --- MANDATORY STUDENT ID CARD ---
        // Golden glowing aura
        ctx.fillStyle = 'rgba(250, 204, 21, 0.35)';
        ctx.beginPath();
        ctx.arc(c.x + c.width / 2, bobY + c.height / 2, 24, 0, Math.PI * 2);
        ctx.fill();

        // Blue Lanyard Ribbon
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(c.x + c.width / 2, bobY - 8);
        ctx.lineTo(c.x + c.width / 2 - 6, bobY + 4);
        ctx.lineTo(c.x + c.width / 2 + 6, bobY + 4);
        ctx.closePath();
        ctx.stroke();

        // Plastic Card Badge
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(c.x, bobY, c.width, c.height);
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2;
        ctx.strokeRect(c.x, bobY, c.width, c.height);

        // Student Photo Box
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(c.x + 4, bobY + 4, 12, 14);
        // Student face silhouette
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(c.x + 10, bobY + 9, 3, 0, Math.PI * 2);
        ctx.fill();

        // Details lines
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(c.x + 18, bobY + 5, 7, 2);
        ctx.fillRect(c.x + 18, bobY + 10, 7, 2);

        // Barcode at bottom
        for (let bx = c.x + 4; bx < c.x + c.width - 4; bx += 3) {
          ctx.fillRect(bx, bobY + 24, 1.5, 6);
        }

        // Floating sparkling indicator
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 8px "Press Start 2P", monospace';
        ctx.fillText('ID CARD', c.x - 14, bobY - 14);
      } else if (c.type === 'coffee') {
        // Coffee Cup (+Speed Boost)
        // White paper cup
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(c.x + 3, bobY);
        ctx.lineTo(c.x + c.width - 3, bobY);
        ctx.lineTo(c.x + c.width - 5, bobY + c.height);
        ctx.lineTo(c.x + 5, bobY + c.height);
        ctx.closePath();
        ctx.fill();

        // Brown Cardboard Sleeve
        ctx.fillStyle = '#92400e';
        ctx.fillRect(c.x + 4, bobY + 7, c.width - 8, 11);

        // Green Cup Lid
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(c.x + 2, bobY - 2, c.width - 4, 4);

        // Animated steam curls
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        const steam1 = Math.sin(gameTime * 6) * 3;
        const steam2 = Math.cos(gameTime * 5) * 3;
        ctx.fillRect(c.x + 7 + steam1, bobY - 8, 2, 4);
        ctx.fillRect(c.x + 13 + steam2, bobY - 11, 2, 4);
      } else if (c.type === 'assignment') {
        // Assignment Sheets
        // Stack of white papers
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(c.x + 2, bobY + 2, c.width, c.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(c.x, bobY, c.width, c.height);

        // Scribbled handwritten lines
        ctx.fillStyle = '#334155';
        for (let ly = bobY + 6; ly < bobY + c.height - 4; ly += 5) {
          ctx.fillRect(c.x + 4, ly, c.width - 8, 1.5);
        }

        // Red "A+" or "DUE" stamp
        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 7px monospace';
        ctx.fillText('DUE!', c.x + 4, bobY + 16);
      } else if (c.type === 'mess_coupon') {
        // Mess Coupon (Gold voucher)
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(c.x, bobY, c.width, c.height);
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(c.x, bobY, c.width, c.height);

        // Fork & Spoon icon or text
        ctx.fillStyle = '#78350f';
        ctx.font = 'bold 6px monospace';
        ctx.fillText('MESS', c.x + 3, bobY + 10);
        ctx.fillText('SAMOSA', c.x + 1, bobY + 18);
      }
    });
  }

  // --- 6. Draw Hazards & NPCs ---
  private drawHazards(hazards: Hazard[], gameTime: number) {
    const ctx = this.ctx;

    hazards.forEach((h) => {
      if (h.type === 'shoes') {
        // Scattered Slippers / Sneakers
        // Sneaker 1
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(h.x, h.y + 4, 18, 10);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(h.x, h.y + 12, 18, 4); // sole
        // Mismatched Flip-Flop
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(h.x + 20, h.y + 6, 16, 8);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(h.x + 24, h.y + 4, 4, 4); // thong strap
      } else if (h.type === 'books') {
        // Heavy Stacks of College Textbooks
        const bookColors = ['#1e3a8a', '#991b1b', '#065f46', '#7c2d12'];
        let by = h.y + h.height;
        for (let i = 0; i < 3; i++) {
          by -= 9;
          ctx.fillStyle = bookColors[i % bookColors.length];
          ctx.fillRect(h.x + (i % 2 === 0 ? 0 : 3), by, h.width - 2, 8);
          // White paper pages edge
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(h.x + h.width - 6 + (i % 2 === 0 ? 0 : 3), by + 1, 4, 6);
        }
      } else if (h.type === 'puddle') {
        // Reflective Water Puddle
        ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.beginPath();
        ctx.ellipse(h.x + h.width / 2, h.y + h.height / 2, h.width / 2, h.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        // Cyan surface reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.ellipse(h.x + h.width / 2 - 10, h.y + h.height / 2 - 1, h.width / 4, h.height / 4, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (h.type === 'dustbin') {
        // Green Hostel Dustbin / Caution Cone
        if (h.id.includes('cone')) {
          // Orange Caution Cone
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.moveTo(h.x + h.width / 2, h.y);
          ctx.lineTo(h.x + h.width, h.y + h.height);
          ctx.lineTo(h.x, h.y + h.height);
          ctx.closePath();
          ctx.fill();
          // White reflective band
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(h.x + 6, h.y + 14, h.width - 12, 6);
        } else {
          // Green Hostel Dustbin
          ctx.fillStyle = '#15803d';
          ctx.fillRect(h.x + 3, h.y + 6, h.width - 6, h.height - 6);
          // Lid
          ctx.fillStyle = '#166534';
          ctx.fillRect(h.x, h.y, h.width, 8);
          // Trash bag overflowing
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(h.x + 5, h.y + 8, 8, 6);
        }
      } else if (h.type === 'football') {
        // ROLLING FOOTBALL HAZARD
        const radius = h.width / 2;
        const centerX = h.x + radius;
        const centerY = h.y + radius;
        const rollAngle = (h.x / 14) * (h.direction || 1);

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rollAngle);

        // Ball base
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Black hexagonal pentagon center
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
          const px = Math.cos(a) * (radius * 0.45);
          const py = Math.sin(a) * (radius * 0.45);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Seams
        ctx.stroke();
        ctx.restore();
      } else if (h.type === 'warden') {
        // --- PATROLLING WARDEN VERMA ---
        this.drawWarden(h, gameTime);
      }
    });
  }

  // Patrolling Warden Verma NPC
  private drawWarden(h: Hazard, gameTime: number) {
    const ctx = this.ctx;
    const dir = h.direction || 1;
    const wx = h.x;
    const wy = h.y;

    ctx.save();
    if (dir === -1) {
      ctx.translate(wx + h.width, wy);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(wx, wy);
    }

    // Walking leg animation
    const legSwing = Math.sin(gameTime * 7) * 8;

    // Legs & Khaki Trousers
    ctx.fillStyle = '#78350f';
    ctx.fillRect(8, 48, 8, 24 + legSwing); // Left leg
    ctx.fillRect(18, 48, 8, 24 - legSwing); // Right leg
    // Black formal shoes
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(6, 70 + legSwing, 12, 5);
    ctx.fillRect(16, 70 - legSwing, 12, 5);

    // Torso: Khaki Safari Jacket
    ctx.fillStyle = '#b45309';
    ctx.fillRect(6, 20, 22, 30);
    // Jacket belt & pockets
    ctx.fillStyle = '#78350f';
    ctx.fillRect(6, 36, 22, 4);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(15, 36, 4, 4); // Brass buckle

    // Head
    ctx.fillStyle = '#d97706'; // warm skin tone
    ctx.fillRect(8, 4, 18, 16);
    // Graying hair
    ctx.fillStyle = '#64748b';
    ctx.fillRect(8, 2, 18, 5);
    ctx.fillRect(6, 4, 4, 10);

    // Spectacles & Strict eyes
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(18, 9, 7, 4);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(20, 10, 4, 2);

    // Thick Gray Mustache!
    ctx.fillStyle = '#475569';
    ctx.fillRect(16, 15, 10, 3);

    // Hand holding Wooden Lathi / Stick
    ctx.fillStyle = '#78350f';
    ctx.save();
    ctx.translate(22, 28);
    ctx.rotate(Math.sin(gameTime * 7) * 0.2);
    ctx.fillRect(0, 0, 4, 38);
    ctx.restore();

    // Funny Alert Balloon overhead
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6, -24, 26, 16);
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('?!', 14, -12);

    ctx.restore();
  }

  // --- 7. Draw Destination (Professor Sharma & Classroom Door) ---
  private drawDestination(gameTime: number, playerHasId: boolean) {
    const ctx = this.ctx;
    const doorX = 4980;
    const doorY = 215;

    // LECTURE HALL 101 DOOR
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(doorX - 6, doorY - 6, 92, 166);
    ctx.fillStyle = '#334155';
    ctx.fillRect(doorX, doorY, 80, 160);

    // Door Window Panel
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(doorX + 16, doorY + 20, 48, 50);
    // Window reflection
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.moveTo(doorX + 16, doorY + 20);
    ctx.lineTo(doorX + 44, doorY + 20);
    ctx.lineTo(doorX + 24, doorY + 70);
    ctx.lineTo(doorX + 16, doorY + 70);
    ctx.fill();

    // Room Label
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(doorX + 10, doorY + 85, 60, 16);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 7px "Press Start 2P", monospace';
    ctx.fillText('ROOM 101', doorX + 12, doorY + 97);

    // Door Handle
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(doorX + 12, doorY + 115, 5, 0, Math.PI * 2);
    ctx.fill();

    // Large Campus Wall Clock above door
    const clockX = doorX + 40;
    const clockY = doorY - 45;
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(clockX, clockY, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Clock Hands (approaching 8:00 AM!)
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(clockX, clockY);
    ctx.lineTo(clockX - 10, clockY - 14); // Minute hand around 7:59
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(clockX, clockY);
    ctx.lineTo(clockX + 8, clockY - 8); // Hour hand around 8
    ctx.stroke();

    // PROFESSOR SHARMA STANDING BY DOOR
    const profX = 4920;
    const profY = 295;

    // Body: Formal Suit & Tie
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(profX + 8, profY + 22, 22, 34); // Suit jacket
    // White shirt collar & red tie
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(profX + 16, profY + 22, 6, 12);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(profX + 18, profY + 26, 3, 14);

    // Trousers & Shoes
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(profX + 9, profY + 56, 8, 24);
    ctx.fillRect(profX + 21, profY + 56, 8, 24);
    ctx.fillRect(profX + 7, profY + 77, 11, 4);
    ctx.fillRect(profX + 21, profY + 77, 11, 4);

    // Head & Glasses
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(profX + 11, profY + 4, 16, 18);
    // Gray hair
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(profX + 10, profY + 2, 18, 5);
    ctx.fillRect(profX + 9, profY + 4, 3, 10);
    // Spectacles
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(profX + 18, profY + 10, 8, 4);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(profX + 20, profY + 11, 4, 2);

    // Professor Arm tapping wrist watch!
    const armTap = Math.sin(gameTime * 6) * 3;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(profX + 2, profY + 26, 8, 18 + armTap);
    // Gold wristwatch
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(profX + 3, profY + 40 + armTap, 6, 4);

    // Speech Bubble from Professor
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(profX - 70, profY - 32, 105, 26);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(profX - 70, profY - 32, 105, 26);
    // Bubble pointer
    ctx.beginPath();
    ctx.moveTo(profX + 10, profY - 6);
    ctx.lineTo(profX + 20, profY - 6);
    ctx.lineTo(profX + 18, profY + 2);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 7px monospace';
    if (!playerHasId) {
      ctx.fillText('NO ID CARD = 0%', profX - 64, profY - 16);
    } else {
      ctx.fillText('HURRY! 8:00 AM!', profX - 64, profY - 16);
    }
  }

  // --- 8. Draw Player Character ---
  private drawPlayer(player: Player, gameTime: number) {
    const ctx = this.ctx;

    // Invulnerability Blink effect
    if (player.invulnerableTimer > 0) {
      if (Math.floor(player.invulnerableTimer * 20) % 2 === 0) {
        return; // Skip rendering frame for strobe effect
      }
    }

    ctx.save();

    // Center translation for squash & stretch scaling
    const centerX = player.x + player.width / 2;
    const bottomY = player.y + player.height;

    ctx.translate(centerX, bottomY);
    ctx.scale(player.squashStretch.scaleX, player.squashStretch.scaleY);

    // Facing direction
    if (player.facing === 'left') {
      ctx.scale(-1, 1);
    }

    const w = player.width;
    const h = player.height;

    // Coffee Speed Boost Aura / Trail
    if (player.speedBoostTimer > 0) {
      ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.beginPath();
      ctx.arc(0, -h / 2, w * 0.9, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- SPRITE GEOMETRY ---
    // Ground origin is at (0, 0), player height goes up to -h

    // 1. Running / Idle / Jump Leg Animation
    let legOffset1 = 0;
    let legOffset2 = 0;

    if (!player.grounded) {
      // Jumping pose: legs spread in air
      legOffset1 = -6;
      legOffset2 = 5;
    } else if (player.state === 'running') {
      // 4-frame running stride cycle
      const cycle = Math.sin(player.animTimer * 16);
      legOffset1 = cycle * 8;
      legOffset2 = -cycle * 8;
    }

    // Legs / Pants (Gray rolled-up pajama sweatpants)
    ctx.fillStyle = '#475569';
    // Back leg
    ctx.fillRect(-8 + legOffset2, -16, 7, 14);
    // Front leg
    ctx.fillRect(1 + legOffset1, -16, 7, 14);

    // Red Sneakers
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-10 + legOffset2, -4, 10, 4);
    ctx.fillRect(-1 + legOffset1, -4, 10, 4);
    // White soles
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-10 + legOffset2, -2, 10, 2);
    ctx.fillRect(-1 + legOffset1, -2, 10, 2);

    // 2. Torso: College T-shirt (Cyan with "CSE" or heart)
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-9, -36, 18, 21);

    // Graphic on T-shirt
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-4, -30, 8, 4);

    // 3. Heavy College Backpack strapped on player's back
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-16, -34, 8, 18);
    // Backpack pocket & zipper
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-16, -26, 8, 8);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-16, -24, 2, 3);

    // 4. Arms
    if (player.state === 'running' && player.grounded) {
      const armSwing = Math.sin(player.animTimer * 16) * 6;
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(-3 - armSwing, -32, 6, 12);
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(-3 - armSwing, -20, 5, 4); // Hand
    } else {
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(4, -32, 5, 12);
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(4, -20, 5, 4);
    }

    // 5. Head & Messy Morning Bed-Hair
    ctx.fillStyle = '#fed7aa'; // Skin tone
    ctx.fillRect(-6, -48, 14, 13);

    // Sleepy Tired Eyes
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(2, -42, 4, 3);
    // Dark circles under eyes (exhausted college student!)
    ctx.fillStyle = '#93c5fd';
    ctx.fillRect(1, -39, 6, 1.5);

    // Disheveled Dark Bed-Hair sticking up in clumps
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(-8, -52, 18, 6);
    // Hair tufts
    ctx.fillRect(-10, -49, 4, 7);
    ctx.fillRect(-4, -55, 6, 5);
    ctx.fillRect(4, -54, 5, 4);

    // Floating ID Card icon over student if collected
    if (player.hasIdCard) {
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(6, -56, 6, 8);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(7, -54, 4, 4);
    }

    ctx.restore();
  }

  // --- 9. Draw Particle Effects ---
  private drawParticles(particles: Particle[]) {
    const ctx = this.ctx;

    particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;

      if (p.shape === 'sparkle') {
        ctx.fillRect(p.x - p.size, p.y, p.size * 2, 2);
        ctx.fillRect(p.x, p.y - p.size, 2, p.size * 2);
      } else if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.restore();
    });
  }

  // --- 10. Draw Floating Texts ---
  private drawFloatingTexts(floatingTexts: FloatingText[]) {
    const ctx = this.ctx;

    floatingTexts.forEach((ft) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 10px "Press Start 2P", monospace';
      // Outline for crisp legibility
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
  }
}
