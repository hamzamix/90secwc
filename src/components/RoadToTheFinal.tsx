import React from 'react';
import { motion } from 'motion/react';
import { Match } from '../types';
import { Team, TEAMS } from '../data/teams';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { calculateStandings } from '../lib/game-logic';

interface RoadToTheFinalProps {
  knockoutMatches: Match[];
  groups?: Record<string, Team[]>;
  groupMatches?: Match[];
}

export const RoadToTheFinal: React.FC<RoadToTheFinalProps> = ({ knockoutMatches, groups, groupMatches }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const getMatchByTeams = (stage: string, teamAId: string, teamBId: string) => {
    return knockoutMatches.find(m => 
      m.stage === stage && 
      ((m.homeTeam.id === teamAId && m.awayTeam.id === teamBId) || 
       (m.homeTeam.id === teamBId && m.awayTeam.id === teamAId))
    );
  };

  const stages = [
    { id: 'final', label: 'THE FINAL', cols: 1 },
    { id: 'sf', label: 'SEMI FINALS', cols: 2 },
    { id: 'qf', label: 'QUARTER FINALS', cols: 4 },
    { id: 'r16', label: 'ROUND OF 16', cols: 4 },
    { id: 'r32', label: 'ROUND OF 32', cols: 4 },
  ];

  const getMatchesForStage = (stageId: string) => {
    return knockoutMatches.filter(m => m.stage === stageId);
  };

  return (
    <div className="w-full max-w-4xl bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-8 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex flex-col items-start text-left">
          <h2 className="text-2xl font-black uppercase tracking-tighter">Road to the Final</h2>
          <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-black">Your Tournament Journey</p>
        </div>
        {isOpen ? <ChevronUp /> : <ChevronDown />}
      </button>

      {isOpen && (
        <div className="p-8 pt-0 space-y-12">
          {stages.map(stage => {
            const matches = getMatchesForStage(stage.id);
            if (matches.length === 0) return null;

            return (
              <div key={stage.id} className="space-y-6">
                <div className="text-center">
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-[0.3em]">{stage.label}</span>
                </div>
                <div className={`grid grid-cols-1 md:grid-cols-2 ${stage.cols === 4 ? 'lg:grid-cols-4' : stage.cols === 1 ? 'lg:grid-cols-1 max-w-sm mx-auto' : 'lg:grid-cols-2 max-w-3xl mx-auto'} gap-6 relative`}>
                  {/* Connector Lines for SF -> Final */}
                  {stage.id === 'sf' && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-1/2 h-6 border-t-2 border-x-2 border-white/10 rounded-t-3xl hidden lg:block" />
                  )}
                  {stage.id === 'final' && (
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-white/10 hidden lg:block" />
                  )}

                  {matches.map(match => (
                    <div key={match.id} className="bg-pitch border border-white/5 p-5 rounded-[2rem] flex flex-col gap-4 relative min-w-0 shadow-xl overflow-hidden">
                      <div className="flex items-center justify-between gap-4">
                        {/* Left Team (Home) */}
                        <div className={`flex flex-col items-center gap-2 flex-1 min-w-0 transition-opacity ${match.winnerId && match.winnerId !== match.homeTeam.id ? 'opacity-30' : 'opacity-100'}`}>
                          <div className="w-10 h-7 rounded-md overflow-hidden border border-white/10 bg-white/5 relative flex-shrink-0">
                            <img 
                              src={`https://flagcdn.com/w160/${match.homeTeam.iso.toLowerCase()}.png`} 
                              alt="" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="font-black text-[10px] uppercase truncate tracking-tighter w-full text-center">{match.homeTeam.id}</span>
                          <div className="h-1.5 flex items-center justify-center">
                            {match.winnerId === match.homeTeam.id && (
                              <div className="w-1.5 h-1.5 rounded-full bg-world-cup shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
                            )}
                          </div>
                        </div>

                        <div className="text-[10px] font-black text-white/10 italic self-center pb-3.5">VS</div>

                        {/* Right Team (Away) */}
                        <div className={`flex flex-col items-center gap-2 flex-1 min-w-0 transition-opacity ${match.winnerId && match.winnerId !== match.awayTeam.id ? 'opacity-30' : 'opacity-100'}`}>
                          <div className="w-10 h-7 rounded-md overflow-hidden border border-white/10 bg-white/5 relative flex-shrink-0">
                            <img 
                              src={`https://flagcdn.com/w160/${match.awayTeam.iso.toLowerCase()}.png`} 
                              alt="" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="font-black text-[10px] uppercase truncate tracking-tighter w-full text-center">{match.awayTeam.id}</span>
                          <div className="h-1.5 flex items-center justify-center">
                            {match.winnerId === match.awayTeam.id && (
                              <div className="w-1.5 h-1.5 rounded-full bg-world-cup shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Group Stage Summary - MOVED TO BOTTOM AND SHOWING 4 TEAMS */}
          {groups && groupMatches && (
            <div className="space-y-6 pt-12 border-t border-white/5">
              <div className="text-center">
                <span className="text-[10px] text-white/40 uppercase font-bold tracking-[0.3em]">GROUP STAGE STANDINGS</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {(Object.entries(groups) as [string, Team[]][]).map(([name, teams]) => {
                  const standings = calculateStandings(name, teams, groupMatches);
                  return (
                    <div key={name} className="bg-pitch/50 border border-white/5 p-3 rounded-xl flex flex-col gap-2">
                      <div className="text-[8px] font-black text-world-cup uppercase tracking-widest border-b border-white/5 pb-1 mb-1">GROUP {name}</div>
                      {standings.slice(0, 4).map((s, idx) => {
                        const teamData = TEAMS.find(t => t.id === s.teamId);
                        return (
                          <div key={s.teamId} className="flex items-center justify-between min-w-0">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className="text-[10px] opacity-30 font-bold">{idx + 1}</span>
                              <div className="w-4 h-2.5 rounded-[1px] overflow-hidden bg-white/5 flex-shrink-0">
                                 <img src={`https://flagcdn.com/w80/${teamData?.iso.toLowerCase() || 'un'}.png`} alt="" className="w-full h-full object-cover" />
                              </div>
                              <span className="text-[10px] font-black truncate uppercase">{s.teamId}</span>
                            </div>
                            <span className="text-[10px] font-bold text-white/40">{s.pts}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
