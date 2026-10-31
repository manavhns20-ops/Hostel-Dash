# HOSTEL DASH: THE 8 AM NIGHTMARE
> A 2D retro pixel-art platformer built with HTML5 Canvas & Web Audio API for a B.Tech Computer Science college assignment.

![Hostel Dash Banner](https://img.shields.io/badge/Platform-Web%20Browser-f59e0b?style=for-the-badge)
![Tech](https://img.shields.io/badge/Tech-HTML5%20Canvas%20%7C%20Web%20Audio-10b981?style=for-the-badge)
![Status](https://img.shields.io/badge/Assignment-Complete%20%26%20Playable-38bdf8?style=for-the-badge)

---

## 🎮 Game Concept & Story

It is Monday morning. The alarm rings at **7:55 AM**.

You are a sleepy first-year college student who has exactly **five in-game minutes** (90 seconds real-time) to reach **Lecture Hall 101** before Professor Sharma locks the doors at **8:00 AM sharp**.

### The Catch:
1. **Your Student ID Card is missing:** It's lying on the high shelf above your hostel bed. You **cannot enter** the lecture hall without it.
2. **Hostel room obstacles:** Scattered shoes and textbooks on the floor.
3. **Hostel corridor:** Leaking water puddles and **Patrolling Warden Verma**, who penalizes sprinting students!
4. **Campus courtyard:** A stray rolling football and long distances to cross.
5. **Academic entrance:** Steps leading up to Lecture Hall 101 with the clock ticking down.

---

## 🕹️ Controls

| Action | Primary Keyboard | Secondary Key | Touch / Mobile |
| :--- | :--- | :--- | :--- |
| **Move Left** | `A` | `←` (Left Arrow) | On-screen `◀` Button |
| **Move Right** | `D` | `→` (Right Arrow) | On-screen `▶` Button |
| **Jump** | `Spacebar` | `W` or `↑` (Up Arrow) | On-screen `JUMP` Button |
| **Pause / Resume** | `Escape` | On-screen Pause Icon `⏸` | `⏸` Button |
| **Mute / Unmute** | `M` | On-screen Speaker Icon `🔊` | Audio Button |

### Advanced Movement Feel:
- **Variable Jump Height:** Release the jump key early to perform a responsive short-hop.
- **Coyote Time (100ms):** Allows jumping for a fraction of a second after stepping off a platform edge.
- **Jump Buffering (120ms):** Pressing jump slightly before touching the ground triggers an immediate jump upon landing.
- **Squash & Stretch:** Character model dynamically squashes upon landing and stretches during takeoff.

---

## 🗺️ Level Progression & Zones

The game features one continuous side-scrolling level with 3 visually distinct sections:

### 1. Section A: Hostel Room (x: 0 – 1100 px)
- **Starting position:** Beside the bunk bed with a ringing alarm clock (`07:55`).
- **Desk & PC:** Glowing CRT monitor with compiler error logs.
- **Mandatory Objective:** Leap onto the high shelf to collect your **Student ID Card**.
- **Message:** `"ID CARD ACQUIRED. YOU ARE NOW LEGALLY A STUDENT."`

### 2. Section B: Hostel Corridor & Campus Courtyard (x: 1100 – 3800 px)
- **Corridor Doors:** Room 102, 103, 104, hostel noticeboard, leaking water cooler.
- **Patrolling Warden Verma:** Paces between x: 1820 and 2200 px. Collision causes `-1 Life`, `-6 seconds` off the clock, and a sharp referee whistle!
- **Outdoor Campus Courtyard:** Morning sunrise sky, drifting pixel clouds, campus fountain, and a **Rolling Football** bouncing along the path.

### 3. Section C: Academic Block & Classroom 101 (x: 3800 – 5200 px)
- **Grand Entrance:** Classical pillars, Dept of Computer Science signboard.
- **Marble Staircase:** 3-tier elevation steps leading to the second-floor lobby.
- **The Destination:** Professor Sharma standing at the door holding a clipboard, tapping his wristwatch.
- **Victory Condition:** Reach the door before 8:00 AM with your Student ID Card!

---

## 📦 Collectibles & Hazards

### Collectibles:
- 🪪 **Student ID Card (Mandatory):** Worth +500 pts. Unlocks classroom entry.
- ☕ **Coffee Cups (Optional):** Grants **Espresso Overdrive** (+50% movement speed boost for 4.5s) and +150 pts.
- 📄 **Assignment Sheets (Optional):** +200 to +300 pts. Labelled *"Submission Deadline: Yesterday"*.
- 🎟️ **Mess Coupons (Optional):** +100 pts. Valid for free samosa / canteen Maggi.

### Hazards & Obstacles:
- 👟 **Scattered Shoes:** -2 seconds stumble.
- 📚 **Textbook Stacks:** -3 seconds toe stub.
- 💧 **Water Puddles:** -3 seconds slip-and-slide.
- ⚽ **Rolling Football:** -3 seconds bounce penalty.
- 👮 **Warden Verma:** -1 Life, -6 seconds, and a warning to submit a written sprint permit!

---

## 🏆 Scoring & Performance Ranks

Your final grade is calculated based on remaining time, lives, and collected assignments:
- **S Rank (Academic Weapon):** Score $\ge 2200$ and Time Left $\ge 35\text{s}$.
- **A Rank (Campus Legend):** Score $\ge 1600$.
- **B Rank (Survived with Dignity):** Score $\ge 1100$.
- **C Rank (Academic Emergency):** Completed with close call.
- **F Rank (Attendance 0%):** Locked out at 8:00 AM or lost all 3 lives.

---

## 🛠️ Architecture & Technical Highlights

1. **Pure Procedural Pixel-Art:**
   - 100% drawn via HTML5 Canvas 2D context (`fillRect`, geometry arcs, and transforms).
   - Zero external PNG/JPG downloads — runs reliably offline and on any network.
2. **Procedural Web Audio API Synthesizer:**
   - Real-time frequency sweeps, square wave arpeggios, and bandpass noise for jump, hit, collect, and victory fanfares.
   - Zero external audio files required.
3. **60 FPS Delta-Time Game Loop:**
   - Independent of display refresh rate (clamped at `Math.min(dt, 0.05)` to prevent tab-switch physics glitches).
4. **Isolated Canvas Mounting:**
   - High performance, 0 React reconciliation overhead during active gameplay frames.

---

## 🚀 How to Run Locally

### Option 1: Modern Dev Environment (Vite + React)
```bash
# Install dependencies
npm install

# Start local development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 2: Standalone Single File (Zero Dependencies)
You can open `/public/standalone.html` directly in **any web browser** without needing Node.js or npm! Simply double-click the file to play.

---

## 📤 How to Upload to GitHub & Host with GitHub Pages

Follow these exact terminal commands to publish your assignment:

```bash
# 1. Initialize git repository
git init

# 2. Stage and commit all files
git add .
git commit -m "feat: complete playable 2D platformer - Hostel Dash"

# 3. Rename branch to main
git branch -M main

# 4. Link your GitHub repository (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/hostel-dash.git

# 5. Push code to GitHub
git push -u origin main
```

### Hosting on GitHub Pages (Free 2-minute setup):
1. In your GitHub repository, click **Settings**.
2. Scroll to the **Pages** tab on the left sidebar.
3. Under **Branch**, select `main` and folder `/ (root)`.
4. Click **Save**.
5. Your playable game link will be live at:
   `https://YOUR_USERNAME.github.io/hostel-dash/`

---

## ✅ College Assignment Testing Checklist

- [x] **Game Starts on User Interaction:** Starts cleanly when clicking "START DASH" or pressing Spacebar.
- [x] **Movement & Jumping:** Left/Right smooth acceleration, variable jump height, coyote time, and collision resolution.
- [x] **Camera Scrolling:** Smooth horizontal tracking following player through 3 distinct zones.
- [x] **Mandatory ID Card Check:** Reaching the door without ID Card pushes player back with a warning.
- [x] **Hazard Interactions:** Warden Verma inflicts life damage; puddles and shoes inflict time penalties.
- [x] **Timer & Countdown:** Campus clock progresses from `07:55:00 AM` to `08:00:00 AM`. Urgent warning at $\le 15\text{s}$.
- [x] **Victory Condition:** Reaching Lecture Hall 101 with ID Card before 8:00 AM triggers fanfare and rank modal.
- [x] **Game Over Condition:** Timer reaching 0 or losing all 3 lives triggers 0% Attendance defeat screen.
- [x] **Audio Synthesizer:** Web Audio API sound effects play for jump, collect, hit, victory, and game over.
- [x] **Sound Toggle:** `M` key and UI button mute/unmute audio cleanly.
- [x] **Pause & Resume:** `Esc` key pauses time, entities, and physics, and resumes accurately.

---

*Created by a first-year B.Tech CSE student for the Semester 1 Game Development Assignment.*
