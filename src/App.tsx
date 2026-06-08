import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Timer, 
  Zap, 
  RotateCcw, 
  Trophy as TrophyIcon,
  ChevronRight,
  TrendingUp,
  Users
} from 'lucide-react';
import { 
  Team, 
  TEAMS 
} from './data/teams';
import { 
  Match, 
  GameState, 
  GroupStanding
} from './types';
import { 
  initializeGroups, 
  generateGroupMatches, 
  calculateStandings, 
  getKnockoutTeamsData,
  KnockoutTeams
} from './lib/game-logic';
import { MatchDecider } from './components/MatchDecider';
import { TeamCard } from './components/TeamCard';
import confetti from 'canvas-confetti';
import { RoadToTheFinal } from './components/RoadToTheFinal';
import { GlobalChampions } from './components/GlobalChampions';

const GROUP_STAGE_TIME = 90;
const EXTRA_TIME = 60;
const KNOCKOUT_TIME_LIMIT = 2; // 2 seconds per decision

export default function App() {
  // Game State
  const [gameState, setGameState] = useState<GameState>('start');
  const [timeLeft, setTimeLeft] = useState(GROUP_STAGE_TIME);
  const [extraTimeUsed, setExtraTimeUsed] = useState(false);
  const [knockoutTimer, setKnockoutTimer] = useState<number | null>(null);
  
  // Data State
  const [groups, setGroups] = useState<Record<string, Team[]>>({});
  const [groupMatches, setGroupMatches] = useState<Match[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [knockoutTeams, setKnockoutTeams] = useState<Team[]>([]);
  const [winner, setWinner] = useState<Team | null>(null);
  const [runnerUp, setRunnerUp] = useState<Team | null>(null);
  const [allKnockoutMatches, setAllKnockoutMatches] = useState<Match[]>([]);
  
  // Stats
  const [globalChampion, setGlobalChampion] = useState<any>(null);

  const winnerColor = useMemo(() => {
    if (!winner) return '#FAFE15';
    const flagColors: Record<string, string> = {
      'MEX': '#006847', 'CAN': '#FF0000', 'USA': '#002868', 'ARG': '#75AADB',
      'BRA': '#009739', 'FRA': '#002395', 'ESP': '#C60B1E', 'ENG': '#FFFFFF',
      'GER': '#000000', 'POR': '#FF0000', 'MAR': '#C1272D', 'NED': '#F36C21',
      'BEL': '#EF3340', 'ITA': '#008C45', 'JPN': '#BC002D', 'CRO': '#FF0000',
      'URU': '#0038A8', 'COL': '#FCD116', 'SUI': '#FF0000', 'TUR': '#E30A17',
      'SEN': '#00853F', 'KOR': '#FFFFFF', 'DEN': '#C60C30', 'AUT': '#ED2939',
      'HAI': '#00209F'
    };
    return flagColors[winner.id] || '#FAFE15';
  }, [winner]);

  // Initialize
  useEffect(() => {
    const fetchChampion = async () => {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        if (data && data.length > 0) {
          setGlobalChampion(data[0]);
        } else {
          setGlobalChampion({ name: 'None yet', flag: '🏆' });
        }
      } catch (err) {
        console.error("Champion fetch failed", err);
        setGlobalChampion({ name: 'Sync Error', flag: '⚠️' });
      }
    };

    fetchChampion();
    const interval = setInterval(fetchChampion, 10000); // Polling for updates since no real-time on sqlite easily
    return () => clearInterval(interval);
  }, []);

  // Timer logic
  useEffect(() => {
    let timer: any;
    if (gameState === 'group' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (gameState === 'group' && timeLeft === 0 && !extraTimeUsed) {
      setExtraTimeUsed(true);
      setTimeLeft(EXTRA_TIME);
    } else if (gameState === 'group' && timeLeft === 0 && extraTimeUsed) {
      autoResolveGroupStage();
    }
    
    return () => clearInterval(timer);
  }, [gameState, timeLeft, extraTimeUsed]);

  // Knockout shot clock
  useEffect(() => {
    let timer: any;
    if (gameState === 'knockout' && knockoutTimer !== null) {
       if (knockoutTimer > 0) {
         timer = setInterval(() => setKnockoutTimer(prev => (prev !== null ? prev - 0.1 : null)), 100);
       } else {
         autoResolveCurrentKnockoutMatch();
       }
    }
    return () => clearInterval(timer);
  }, [gameState, knockoutTimer]);

  const autoResolveGroupStage = useCallback(() => {
    const pot1 = ["MEX", "CAN", "USA", "ARG", "FRA", "ESP", "ENG", "BRA", "POR", "NED", "BEL", "MAR"];
    const updatedMatches = [...matches];
    for (let i = currentIndex; i < updatedMatches.length; i++) {
       const m = updatedMatches[i];
       if (m.winnerId !== null || m.isDraw) continue;

       const homeIsStrong = pot1.includes(m.homeTeam.id);
       const awayIsStrong = pot1.includes(m.awayTeam.id);
       
       const rand = Math.random();
       if (homeIsStrong && !awayIsStrong) {
         if (rand < 0.65) updatedMatches[i].winnerId = m.homeTeam.id;
         else if (rand < 0.85) updatedMatches[i].isDraw = true;
         else updatedMatches[i].winnerId = m.awayTeam.id;
       } else if (awayIsStrong && !homeIsStrong) {
         if (rand < 0.65) updatedMatches[i].winnerId = m.awayTeam.id;
         else if (rand < 0.85) updatedMatches[i].isDraw = true;
         else updatedMatches[i].winnerId = m.homeTeam.id;
       } else {
         // Evenly matched or both weak
         if (rand < 0.4) updatedMatches[i].winnerId = m.homeTeam.id;
         else if (rand < 0.8) updatedMatches[i].winnerId = m.awayTeam.id;
         else updatedMatches[i].isDraw = true;
       }
    }
    setMatches(updatedMatches);
    const knockoutData = getKnockoutTeamsData(groups, updatedMatches);
    prepareKnockouts(knockoutData);
  }, [currentIndex, matches, groups]);

  const autoResolveCurrentKnockoutMatch = useCallback(() => {
    const winnerId = Math.random() > 0.5 ? matches[currentIndex].homeTeam.id : matches[currentIndex].awayTeam.id;
    handleDecision(winnerId, false);
  }, [currentIndex, matches]);

  const startNewGame = useCallback(() => {
    const newGroups = initializeGroups();
    const matchesList = generateGroupMatches(newGroups);
    
    setGroups(newGroups);
    setGroupMatches(matchesList);
    setMatches(matchesList);
    setCurrentIndex(0);
    setTimeLeft(GROUP_STAGE_TIME);
    setExtraTimeUsed(false);
    setGameState('group');
    setWinner(null);
    setRunnerUp(null);
    setAllKnockoutMatches([]);
  }, []);

  const handleDecision = (winnerId: string | null, isDraw: boolean) => {
    const updatedMatches = [...matches];
    updatedMatches[currentIndex] = {
      ...updatedMatches[currentIndex],
      winnerId,
      isDraw
    };
    
    setMatches(updatedMatches);
    
    if (currentIndex < matches.length - 1) {
      setCurrentIndex(currentIndex + 1);
      if (gameState === 'knockout') {
        setKnockoutTimer(KNOCKOUT_TIME_LIMIT);
      }
    } else {
      // Transition Stage
      if (gameState === 'group') {
        const knockoutData = getKnockoutTeamsData(groups, updatedMatches);
        prepareKnockouts(knockoutData);
      } else if (gameState === 'knockout') {
        // Handle knockout round progression
        progressKnockout(updatedMatches);
      }
    }
  };

  const prepareKnockouts = (data: KnockoutTeams) => {
    const { groupWinners: W, groupRunnersUp: RU, bestThirds: T } = data;
    const r32Matches: Match[] = [];
    
    // Official-style pairing for R32 (48 teams -> 32 teams)
    const pairings = [
      { h: W['A'], a: T[0] }, // Match 1
      { h: RU['A'], a: RU['B'] }, // Match 2
      { h: W['C'], a: T[1] }, // Match 3
      { h: W['D'], a: RU['E'] }, // Match 4
      { h: W['E'], a: T[2] }, // Match 5
      { h: W['F'], a: RU['G'] }, // Match 6
      { h: W['G'], a: T[3] }, // Match 7
      { h: W['I'], a: RU['J'] }, // Match 8
      { h: W['B'], a: T[4] }, // Match 9
      { h: W['K'], a: RU['L'] }, // Match 10
      { h: W['L'], a: RU['K'] }, // Match 11
      { h: W['J'], a: RU['H'] }, // Match 12
      { h: W['H'], a: RU['I'] }, // Match 13
      { h: RU['C'], a: RU['D'] }, // Match 14
      { h: RU['F'], a: T[5] }, // Match 15
      { h: RU['G'], a: T[6] }  // Match 16
    ];

    pairings.forEach((p, i) => {
      if (p.h && p.a) {
        r32Matches.push({
          id: `r32-${i}`,
          homeTeam: p.h,
          awayTeam: p.a,
          winnerId: null,
          isDraw: false,
          stage: 'r32'
        });
      }
    });

    // Fallback if some teams are missing (shouldn't happen with full groups)
    if (r32Matches.length < 16) {
      console.warn("R32 match count is low, check group stage results");
    }

    setMatches(r32Matches);
    setAllKnockoutMatches(prev => [...prev, ...r32Matches]);
    setCurrentIndex(0);
    setGameState('knockout');
    setKnockoutTimer(KNOCKOUT_TIME_LIMIT);
  };

  const progressKnockout = (finishedMatches: Match[]) => {
    // Update allKnockoutMatches with results
    setAllKnockoutMatches(prev => {
      const updated = [...prev];
      finishedMatches.forEach(fm => {
        const idx = updated.findIndex(m => m.id === fm.id);
        if (idx !== -1) updated[idx] = fm;
      });
      return updated;
    });

    const winners = finishedMatches.map(m => m.winnerId ? TEAMS.find(t => t.id === m.winnerId)! : m.homeTeam);
    
    if (winners.length === 1) {
      const finalMatch = finishedMatches[0];
      const theRunnerUp = finalMatch.winnerId === finalMatch.homeTeam.id ? finalMatch.awayTeam : finalMatch.homeTeam;
      setRunnerUp(theRunnerUp);
      handleGameWin(winners[0], theRunnerUp);
      return;
    }

    const nextStage = winners.length === 16 ? 'r16' : 
                     winners.length === 8 ? 'qf' : 
                     winners.length === 4 ? 'sf' : 'final';
    
    const nextMatches: Match[] = [];
    for (let i = 0; i < winners.length; i += 2) {
      nextMatches.push({
        id: `${nextStage}-${i}`,
        homeTeam: winners[i],
        awayTeam: winners[i+1],
        winnerId: null,
        isDraw: false,
        stage: nextStage as any
      });
    }
    
    setMatches(nextMatches);
    setAllKnockoutMatches(prev => [...prev, ...nextMatches]);
    setCurrentIndex(0);
    setKnockoutTimer(KNOCKOUT_TIME_LIMIT);
  };

  const handleGameWin = async (theWinner: Team, theRunnerUp: Team) => {
    setWinner(theWinner);
    setGameState('win');
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });

    try {
      await fetch('/api/win', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: theWinner.id,
          name: theWinner.name,
          flag: theWinner.flag,
          iso: theWinner.iso
        })
      });
      await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          championId: theWinner.id,
          runnerUpId: theRunnerUp.id
        })
      });
    } catch (e) {
      console.error("Failed to save win", e);
    }
  };

  const currentMatch = matches[currentIndex];

  return (
    <div className="min-h-screen bg-pitch-dark text-white font-sans selection:bg-world-cup/30 border-8 border-world-cup relative overflow-x-hidden">
      {/* HUD Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-pitch-dark/40 backdrop-blur-xl border-b border-white/5 h-20 flex items-center px-10 justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-world-cup px-3 py-1 font-black text-lg text-black skew-x-[-12deg]">
            90SEC
          </div>
          <span className="font-black text-2xl uppercase tracking-tighter hidden sm:block">World Cup <span className="text-world-cup">2026</span></span>
        </div>

        <div className="flex items-center gap-6">
          {gameState !== 'start' && (
            <div className="flex flex-col items-end mr-6">
              <span className="text-[10px] text-white/40 uppercase font-black tracking-[0.3em] mb-1">
                Match {currentIndex + 1}/{matches.length}
              </span>
              <div className="w-48 h-1 bg-white/5 rounded-full relative overflow-hidden">
                <motion.div 
                  className="absolute inset-0 bg-world-cup shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentIndex + 1) / matches.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {gameState !== 'start' && (
            <div className={`font-mono font-black text-4xl tracking-tighter ${timeLeft < 20 ? 'text-red-500' : 'text-world-cup'}`}>
               {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>
      </header>

      <main className="pt-24 pb-12 flex flex-col items-center justify-center min-h-screen">
        <AnimatePresence mode="wait">
          {gameState === 'start' && (
             <motion.div 
               key="start"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="flex flex-col items-center text-center w-full px-10"
             >
               <div className="w-full flex flex-col md:flex-row justify-between items-center mb-20 gap-10">
                 <div className="flex flex-col text-left">
                   <div className="bg-world-cup text-black px-4 py-1 font-black text-xl skew-x-[-12deg] w-fit mb-4">90SEC</div>
                   <h1 className="text-6xl md:text-8xl font-black uppercase leading-[0.9] tracking-tighter mb-4">
                     World Cup<br/>
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-world-cup via-vibrant-green to-vibrant-blue">
                       2026 Edition
                     </span>
                   </h1>
                   <p className="text-xl md:text-2xl font-medium opacity-80 uppercase tracking-widest">
                     104 Matches. Pure Instinct.
                   </p>
                 </div>

                 <div className="flex flex-col items-center md:-translate-y-8">
                   <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40 mb-2 text-center w-full">Current Champion</span>
                   <div className="flex items-center bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-[2rem] shadow-2xl">
                     <div className="w-12 h-8 bg-black/40 rounded mr-4 relative overflow-hidden flex items-center justify-center text-xl">
                        {globalChampion?.iso ? (
                          <img src={`https://flagcdn.com/w80/${globalChampion.iso.toLowerCase()}.png`} alt="" className="w-full h-full object-cover" />
                        ) : globalChampion?.flag || '🏆'}
                     </div>
                     <span className="text-2xl font-black uppercase tracking-tighter">
                       {globalChampion?.name || 'Brazil'}
                     </span>
                   </div>
                 </div>
               </div>

               <div className="flex flex-col items-center gap-12 w-full mb-24">
                 <button 
                   onClick={startNewGame}
                   className="group relative"
                 >
                   <div className="absolute -inset-4 bg-gradient-to-r from-world-cup to-vibrant-green rounded-full blur-xl opacity-40 group-hover:opacity-70 transition-opacity"></div>
                   <div className="relative px-20 py-8 bg-white text-pitch rounded-full font-black text-4xl uppercase tracking-tighter shadow-2xl transition-transform active:scale-95 group-hover:-translate-y-1">
                     Start Challenge
                   </div>
                 </button>
                 
                 <GlobalChampions />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl text-left">
                  <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 flex flex-col h-full hover:bg-white/[0.07] transition-colors group">
                    <div className="w-12 h-12 bg-world-cup text-black flex items-center justify-center rounded-full font-black mb-6 text-xl translate-y-0 group-hover:-translate-y-1 transition-transform">1</div>
                    <h3 className="text-2xl font-black mb-3 uppercase text-world-cup tracking-tighter">Group Stage</h3>
                    <p className="text-sm leading-relaxed text-white/50 font-medium uppercase tracking-wide">90 seconds total. Tap a team card for a win (+3 pts) or tap Draw for both. Speed is key.</p>
                  </div>

                  <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 flex flex-col h-full hover:bg-white/[0.07] transition-colors group">
                    <div className="w-12 h-12 bg-vibrant-green text-black flex items-center justify-center rounded-full font-black mb-6 text-xl translate-y-0 group-hover:-translate-y-1 transition-transform">2</div>
                    <h3 className="text-2xl font-black mb-3 uppercase text-vibrant-green tracking-tighter">Extra Time</h3>
                    <p className="text-sm leading-relaxed text-white/50 font-medium uppercase tracking-wide">Clock hit zero? You get 60s of survival time, but points are halved and pressure is doubled.</p>
                  </div>

                  <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 flex flex-col h-full hover:bg-white/[0.07] transition-colors group">
                    <div className="w-12 h-12 bg-vibrant-blue text-white flex items-center justify-center rounded-full font-black mb-6 text-xl translate-y-0 group-hover:-translate-y-1 transition-transform">3</div>
                    <h3 className="text-2xl font-black mb-3 uppercase text-vibrant-blue tracking-tighter">Knockouts</h3>
                    <p className="text-sm leading-relaxed text-white/50 font-medium uppercase tracking-wide">2 second shot clock per match. Decide instantly or the dream is over.</p>
                  </div>
               </div>
             </motion.div>
          )}

          {(gameState === 'group' || gameState === 'knockout') && (
            <motion.div 
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center w-full"
            >
              {/* Progress Bar */}
              <div className="fixed top-16 left-0 right-0 h-1 bg-white/5">
                <motion.div 
                   className={`h-full ${gameState === 'knockout' ? 'bg-vibrant-blue shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-vibrant-teal shadow-[0_0_10px_rgba(45,212,191,0.5)]'}`}
                   initial={{ width: 0 }}
                   animate={{ width: `${((currentIndex + 1) / matches.length) * 100}%` }}
                />
              </div>

              {/* Shot Clock for Knockouts */}
              {gameState === 'knockout' && knockoutTimer !== null && (
                 <div className="mb-8 flex flex-col items-center">
                    <div className="text-blue-400 font-mono text-5xl font-bold italic tracking-tighter">
                      {knockoutTimer.toFixed(1)}
                    </div>
                    <span className="text-[10px] text-blue-400/50 uppercase tracking-[0.3em] font-bold mt-1">Shot Clock</span>
                 </div>
              )}

              <MatchDecider 
                match={currentMatch} 
                onDecide={handleDecision} 
                matchesLeft={matches.length - currentIndex}
              />

              {/* Quick Sim Option for Group Stage */}
              {gameState === 'group' && (
                <motion.button 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={autoResolveGroupStage}
                  className="mt-12 flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/30 hover:text-world-cup transition-all uppercase tracking-[0.3em] font-black text-[10px] group"
                >
                  <Zap className="w-4 h-4 text-world-cup group-hover:scale-125 transition-transform" />
                  Quick Sim Rest of Group Stage
                </motion.button>
              )}
            </motion.div>
          )}

          {gameState === 'win' && (
            <motion.div 
              key="win"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center text-center px-6 relative w-full"
              style={{ '--winner-color': winnerColor } as React.CSSProperties}
            >
              {/* Dynamic Winner Glow */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] -z-20 opacity-40 blur-[160px] rounded-full animate-pulse transition-colors duration-1000"
                style={{
                  background: winner?.iso ? `radial-gradient(circle, var(--winner-color, #FAFE15) 0%, transparent 70%)` : undefined,
                  display: winner?.iso ? 'block' : 'none'
                }}
              />
              {!winner?.iso && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] -z-20 opacity-30 blur-[120px] rounded-full bg-gradient-to-br from-world-cup via-white to-vibrant-blue animate-pulse" />}
              
              <div className="mb-8 relative scale-110">
                 <TrophyIcon className="w-48 h-48 text-world-cup animate-bounce shadow-2xl filter drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]" />
                 <div className="absolute inset-0 bg-world-cup/20 blur-3xl rounded-full -z-10 animate-pulse"></div>
              </div>
              
              <h1 className="text-9xl font-black mb-6 uppercase italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 drop-shadow-2xl">
                CHAMPIONS!
              </h1>
              
              <div className="group relative mb-16 scale-105">
                <div 
                  className="absolute -inset-2 rounded-[4rem] blur-2xl opacity-40 group-hover:opacity-70 transition duration-1000 animate-pulse"
                  style={{ backgroundColor: 'var(--winner-color, #FAFE15)' }}
                ></div>
                <div 
                  className="relative flex items-center gap-12 bg-black/80 backdrop-blur-3xl px-16 py-12 rounded-[3.5rem] border-4 shadow-[0_0_100px_rgba(0,0,0,0.5)] transition-colors duration-1000"
                  style={{ borderColor: 'var(--winner-color, rgba(255,255,255,0.1))' }}
                >
                   <div className="w-48 h-32 rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl relative bg-white/5">
                      <img 
                        src={`https://flagcdn.com/w320/${winner?.iso.toLowerCase()}.png`} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.4)]" />
                   </div>
                   <div className="flex flex-col items-center">
                     <span className="text-7xl font-black uppercase tracking-tighter text-white italic drop-shadow-2xl">{winner?.name}</span>
                     <div className="flex items-center justify-center gap-3 mt-3">
                       <div className="h-0.5 w-12 bg-world-cup"></div>
                       <span className="text-sm text-world-cup uppercase tracking-[0.5em] font-black">World Cup 2026 Winner</span>
                     </div>
                   </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-8 w-full max-w-4xl mb-12">
                 <RoadToTheFinal 
                   knockoutMatches={allKnockoutMatches} 
                   groups={groups}
                   groupMatches={groupMatches}
                 />
                 <GlobalChampions />
              </div>

              <div className="flex gap-6 w-full max-w-md">
                <button 
                  onClick={startNewGame}
                  className="flex-1 bg-world-cup text-pitch py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-transform"
                >
                  <RotateCcw className="w-6 h-6" /> Again
                </button>
                <button 
                  onClick={() => setGameState('start')}
                  className="flex-1 bg-white/5 border-2 border-white/10 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-white/10"
                >
                  Menu
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'loss' && (
            <motion.div 
              key="loss"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center text-center p-12"
            >
              <div className="mb-12 relative">
                 <div className="p-16 bg-red-500/10 rounded-full border-8 border-red-500 shadow-[0_0_60px_rgba(239,68,68,0.4)]">
                    <Timer className="w-32 h-32 text-red-500" />
                 </div>
                 <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full -z-10 animate-pulse"></div>
              </div>
              <h1 className="text-8xl font-black mb-6 uppercase italic tracking-tighter text-red-500">TIME'S UP!</h1>
              <p className="text-white/40 mb-12 max-w-sm uppercase tracking-[0.4em] font-black text-sm">
                The buzzer sounds. The stadium goes dark. Your dream is deferred.
              </p>

              <button 
                onClick={startNewGame}
                className="w-full max-w-md bg-white text-pitch py-6 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-transform shadow-2xl"
              >
                <RotateCcw className="w-6 h-6" /> One More Run
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

    </div>
  );
}
