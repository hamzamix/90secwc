import React from 'react';
import { Match } from '../types';
import { TeamCard } from './TeamCard';
import { motion, AnimatePresence } from 'motion/react';

interface MatchDeciderProps {
  match: Match | null;
  onDecide: (winnerId: string | null, isDraw: boolean) => void;
  matchesLeft?: number;
}

export const MatchDecider: React.FC<MatchDeciderProps> = ({ match, onDecide, matchesLeft }) => {
  if (!match) return null;

  return (
    <div className="flex flex-col items-center w-full max-w-lg px-4">
      {/* Group Info */}
      <div className="mb-8 text-center">
         <div className="text-white/40 text-sm font-black uppercase tracking-[0.4em] leading-none">
           {match.stage === 'group' ? `Group ${match.group}` : `${match.stage.toUpperCase()}`}
         </div>
      </div>

      <div className="flex flex-col items-center w-full gap-4 relative">
        <TeamCard 
          team={match.homeTeam} 
          onClick={() => onDecide(match.homeTeam.id, false)}
          className="w-full h-64"
        />
        
        {match.stage === 'group' && (
          <div className="flex flex-col items-center -my-6 relative z-10 w-full">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDecide(null, true)}
              className="px-12 py-5 bg-[#0f172a] border-2 border-white/10 rounded-full text-white font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-white/5 transition-all text-sm backdrop-blur-3xl"
            >
              DRAW (1 PT EACH)
            </motion.button>
          </div>
        )}

        <TeamCard 
          team={match.awayTeam} 
          onClick={() => onDecide(match.awayTeam.id, false)}
          className="w-full h-64"
        />
      </div>
    </div>
  );
};
