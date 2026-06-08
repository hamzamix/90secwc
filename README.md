<p align="center">  90SEC World Cup 2026 Simulator </p>

<p align="center">
  <img src="./logo.png" alt="90secwc Logo" width="120" height="120">
</p>

A fast-paced World Cup 2026 simulator where you decide the matches in seconds. Survive the group stage and conquer the knockouts to become the ultimate champion.

## Features

- **Rapid Match Decisions**: Make quick calls for every match of the 2026 World Cup.
- **Dynamic Group Stage**: 48 teams, 12 groups, and a 90-second total time limit.
- **High-Pressure Knockouts**: 2-second decision clock for knockout rounds.
- **Global Leaderboard**: Local SQLite database tracks which teams are crowned most often.
- **Full-Stack Architecture**: React frontend with an Express + SQLite backend.
- **Vibrant UI**: Modern, dark-themed interface with smooth animations using Motion.

## 📸 Screenshots

![90secwc Screenshots](https://raw.githubusercontent.com/hamzamix/90secwc/refs/heads/main/Screenshots/home.png)

![Starwise Screenshots](https://raw.githubusercontent.com/hamzamix/90secwc/refs/heads/main/Screenshots/home2.png)

![Starwise Screenshots](https://raw.githubusercontent.com/hamzamix/90secwc/refs/heads/main/Screenshots/winner.png)

![Starwise Screenshots](https://raw.githubusercontent.com/hamzamix/90secwc/refs/heads/main/Screenshots/winner2.png)

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Motion (formerly Framer Motion), Lucide React.
- **Backend**: Node.js, Express, Better-SQLite3.
- **Styling**: Tailwind CSS 4.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/world-cup-2026-simulator.git
   cd world-cup-2026-simulator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   npm start
   ```

## Local Development

The app uses a local SQLite database (`worldcup.db`) to store champion statistics.
The server runs on port 3000 and serves both the API and the static frontend assets.

## License

This project is open-source. Feel free to fork and modify!
