/**
 * Level Geometry, Platforms, Collectibles, and Hazards for Hostel Dash
 */

import { Platform, Collectible, Hazard } from './types';

export const LEVEL_WIDTH = 5200;
export const LEVEL_HEIGHT = 540;
export const GROUND_Y = 450;
export const FINISH_LINE_X = 4920;

export function createInitialPlatforms(): Platform[] {
  return [
    // 1. Ground across the entire level
    // Hostel Room Ground (Tiles)
    { x: 0, y: GROUND_Y, width: 1100, height: 90, type: 'solid', color: '#2b211b' },
    // Hostel Corridor Ground
    { x: 1100, y: GROUND_Y, width: 1200, height: 90, type: 'solid', color: '#38302b' },
    // Courtyard Ground (Grass & Cobblestone)
    { x: 2300, y: GROUND_Y, width: 1650, height: 90, type: 'solid', color: '#2d4a22' },
    // Academic Steps & Elevated Main Floor
    { x: 3950, y: 425, width: 90, height: 115, type: 'solid', color: '#64748b' },
    { x: 4040, y: 400, width: 90, height: 140, type: 'solid', color: '#64748b' },
    { x: 4130, y: 375, width: 90, height: 165, type: 'solid', color: '#64748b' },
    { x: 4220, y: 375, width: 980, height: 165, type: 'solid', color: '#475569' },

    // SECTION A: Hostel Room Platforms
    // Bed frame
    { x: 30, y: 395, width: 150, height: 55, type: 'solid', color: '#8b5a2b' },
    // Study Desk
    { x: 420, y: 370, width: 140, height: 80, type: 'solid', color: '#78350f' },
    // High Wall Shelf (Where ID Card is placed!)
    { x: 620, y: 285, width: 160, height: 18, type: 'one-way', color: '#92400e' },
    // Wardrobe Top
    { x: 800, y: 300, width: 100, height: 150, type: 'solid', color: '#5b2f12' },

    // SECTION B: Hostel Corridor Platforms
    // Shoe Rack
    { x: 1260, y: 380, width: 110, height: 20, type: 'one-way', color: '#7c3aed' },
    // Notice Board Bench
    { x: 1540, y: 355, width: 130, height: 20, type: 'one-way', color: '#854d0e' },
    // Wall Ledge 1
    { x: 1840, y: 310, width: 130, height: 18, type: 'one-way', color: '#475569' },
    // Wall Ledge 2
    { x: 2080, y: 330, width: 120, height: 18, type: 'one-way', color: '#475569' },

    // SECTION B (Cont.): Campus Courtyard Platforms
    // Stone Bench 1
    { x: 2500, y: 385, width: 110, height: 22, type: 'bench', color: '#94a3b8' },
    // Campus Fountain Rim
    { x: 2740, y: 345, width: 170, height: 25, type: 'solid', color: '#0284c7' },
    // Brick Garden Wall
    { x: 3050, y: 320, width: 150, height: 25, type: 'one-way', color: '#b91c1c' },
    // Street Lamp Platform
    { x: 3360, y: 295, width: 120, height: 18, type: 'one-way', color: '#334155' },
    // Stone Bench 2
    { x: 3620, y: 390, width: 100, height: 22, type: 'bench', color: '#94a3b8' },

    // SECTION C: Academic Block Platforms
    // Notice Board Ledge
    { x: 4340, y: 290, width: 130, height: 18, type: 'one-way', color: '#d97706' },
    // Department Reception Counter
    { x: 4590, y: 315, width: 130, height: 60, type: 'solid', color: '#1e293b' },
  ];
}

export function createInitialCollectibles(): Collectible[] {
  return [
    // --- SECTION A: Hostel Room ---
    // 1. MANDATORY ID CARD (On high shelf above bed/desk)
    {
      id: 'id_card_01',
      x: 690,
      y: 245,
      width: 28,
      height: 36,
      type: 'id_card',
      collected: false,
      bobOffset: 0,
      title: 'Student ID Card',
      points: 500,
    },
    // Coffee Cup 1 (on study desk)
    {
      id: 'coffee_01',
      x: 480,
      y: 335,
      width: 22,
      height: 26,
      type: 'coffee',
      collected: false,
      bobOffset: 1,
      title: 'Espresso Surge (+Speed Boost)',
      points: 150,
    },
    // Assignment Sheet 1 (Near door)
    {
      id: 'assign_01',
      x: 930,
      y: 415,
      width: 24,
      height: 28,
      type: 'assignment',
      collected: false,
      bobOffset: 2,
      title: 'Data Structures Lab 3 (Due Yesterday)',
      points: 200,
    },

    // --- SECTION B: Corridor & Campus ---
    // Mess Coupon 1 (on shoe rack)
    {
      id: 'coupon_01',
      x: 1300,
      y: 345,
      width: 26,
      height: 22,
      type: 'mess_coupon',
      collected: false,
      bobOffset: 0.5,
      title: 'Mess Coupon (Free Samosa)',
      points: 100,
    },
    // Assignment Sheet 2 (above notice board bench)
    {
      id: 'assign_02',
      x: 1600,
      y: 315,
      width: 24,
      height: 28,
      type: 'assignment',
      collected: false,
      bobOffset: 1.5,
      title: 'Computer Networks Quiz Sheet',
      points: 200,
    },
    // Coffee Cup 2 (on corridor wall ledge)
    {
      id: 'coffee_02',
      x: 1890,
      y: 270,
      width: 22,
      height: 26,
      type: 'coffee',
      collected: false,
      bobOffset: 2.2,
      title: 'Hostel Filter Coffee (+Speed)',
      points: 150,
    },
    // Mess Coupon 2 (above corridor door)
    {
      id: 'coupon_02',
      x: 2130,
      y: 290,
      width: 26,
      height: 22,
      type: 'mess_coupon',
      collected: false,
      bobOffset: 0.8,
      title: 'Special Chai Voucher',
      points: 100,
    },

    // Courtyard Collectibles
    // Mess Coupon 3 (above stone bench)
    {
      id: 'coupon_03',
      x: 2540,
      y: 345,
      width: 26,
      height: 22,
      type: 'mess_coupon',
      collected: false,
      bobOffset: 1.2,
      title: 'Canteen Maggi Pass',
      points: 100,
    },
    // Coffee Cup 3 (above campus fountain)
    {
      id: 'coffee_03',
      x: 2810,
      y: 305,
      width: 22,
      height: 26,
      type: 'coffee',
      collected: false,
      bobOffset: 2.5,
      title: 'Cold Brew Overdrive (+Speed)',
      points: 150,
    },
    // Assignment Sheet 3 (above garden brick wall)
    {
      id: 'assign_03',
      x: 3110,
      y: 280,
      width: 24,
      height: 28,
      type: 'assignment',
      collected: false,
      bobOffset: 0.3,
      title: 'OS Process Synchronization Code',
      points: 250,
    },
    // Mess Coupon 4 (on street lamp ledge)
    {
      id: 'coupon_04',
      x: 3410,
      y: 255,
      width: 26,
      height: 22,
      type: 'mess_coupon',
      collected: false,
      bobOffset: 1.8,
      title: 'Late Night Canteen Coupon',
      points: 100,
    },

    // --- SECTION C: Academic Block ---
    // Assignment Sheet 4 (Academic notice board)
    {
      id: 'assign_04',
      x: 4390,
      y: 250,
      width: 24,
      height: 28,
      type: 'assignment',
      collected: false,
      bobOffset: 2.0,
      title: 'Algorithms Final Report',
      points: 300,
    },
    // Coffee Cup 4 (Department counter)
    {
      id: 'coffee_04',
      x: 4640,
      y: 275,
      width: 22,
      height: 26,
      type: 'coffee',
      collected: false,
      bobOffset: 1.0,
      title: 'Faculty Lounge Secret Coffee (+Speed)',
      points: 150,
    },
    // Mess Coupon 5 (Near classroom door)
    {
      id: 'coupon_05',
      x: 4820,
      y: 335,
      width: 26,
      height: 22,
      type: 'mess_coupon',
      collected: false,
      bobOffset: 0.4,
      title: 'Dean’s Honor Samosa Token',
      points: 120,
    },
  ];
}

export function createInitialHazards(): Hazard[] {
  return [
    // SECTION A: Hostel Room Hazards
    {
      id: 'shoes_01',
      x: 320,
      y: 432,
      width: 38,
      height: 18,
      type: 'shoes',
      damage: 0,
      timePenalty: 2,
      message: 'TRIPPED ON SNEAKERS! -2s',
    },
    {
      id: 'shoes_02',
      x: 740,
      y: 432,
      width: 36,
      height: 18,
      type: 'shoes',
      damage: 0,
      timePenalty: 2,
      message: 'SLIPPED ON FLIP-FLOP! -2s',
    },

    // SECTION B: Hostel Corridor Hazards
    {
      id: 'puddle_01',
      x: 1380,
      y: 442,
      width: 70,
      height: 8,
      type: 'puddle',
      damage: 0,
      timePenalty: 3,
      message: 'WATER COOLER LEAK! SLIP & SLIDE! -3s',
    },
    {
      id: 'books_01',
      x: 1510,
      y: 418,
      width: 36,
      height: 32,
      type: 'books',
      damage: 0,
      timePenalty: 3,
      message: 'STUBBED TOE ON 1000-PAGE MATH TEXTBOOK! -3s',
    },
    {
      id: 'dustbin_01',
      x: 1710,
      y: 412,
      width: 32,
      height: 38,
      type: 'dustbin',
      damage: 0,
      timePenalty: 2,
      message: 'KICKED THE HOSTEL DUSTBIN! -2s',
    },
    // MOVING HAZARD: PATROLLING WARDEN VERMA
    {
      id: 'warden_01',
      x: 1860,
      y: 375,
      width: 34,
      height: 75,
      type: 'warden',
      vx: 1.4,
      direction: 1,
      minX: 1820,
      maxX: 2200,
      damage: 1, // Loses 1 Life!
      timePenalty: 6, // Plus 6 seconds penalty!
      message: 'WARDEN VERMA: "NO RUNNING IN MY CORRIDOR! SUBMIT AN APPLICATION!" -1 LIFE & -6s',
    },

    // SECTION B: Campus Courtyard Hazards
    // MOVING HAZARD: ROLLING FOOTBALL
    {
      id: 'football_01',
      x: 2600,
      y: 422,
      width: 28,
      height: 28,
      type: 'football',
      vx: 2.2,
      direction: 1,
      minX: 2520,
      maxX: 2950,
      damage: 0,
      timePenalty: 3,
      message: 'STRAY FOOTBALL HIT! -3s',
    },
    {
      id: 'puddle_02',
      x: 3220,
      y: 442,
      width: 65,
      height: 8,
      type: 'puddle',
      damage: 0,
      timePenalty: 3,
      message: 'LAWN SPRINKLER MUD PUDDLE! -3s',
    },
    {
      id: 'books_02',
      x: 3510,
      y: 420,
      width: 36,
      height: 30,
      type: 'books',
      damage: 0,
      timePenalty: 2,
      message: 'ABANDONED EXAM PAPERS PILE! -2s',
    },

    // SECTION C: Academic Block Hazards
    {
      id: 'dustbin_02',
      x: 4430,
      y: 340,
      width: 30,
      height: 35,
      type: 'dustbin',
      damage: 0,
      timePenalty: 2,
      message: 'WET FLOOR CAUTION CONE! -2s',
    },
    {
      id: 'books_03',
      x: 4740,
      y: 345,
      width: 36,
      height: 30,
      type: 'books',
      damage: 0,
      timePenalty: 3,
      message: 'PROFESSOR’S UNGRADED TEST STACK! -3s',
    },
  ];
}
