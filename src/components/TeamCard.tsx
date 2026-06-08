import React from 'react';
import { Team } from '../data/teams';
import { motion } from 'motion/react';

interface TeamCardProps {
  team: Team;
  isPicked?: boolean;
  onClick?: () => void;
  className?: string;
}

export const TeamCard: React.FC<TeamCardProps> = ({ team, isPicked, onClick, className }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02, translateY: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center p-8 rounded-[2.5rem] border-2 transition-all duration-300 overflow-hidden group
        ${isPicked 
          ? 'bg-[#1e293b]/80 border-vibrant-teal shadow-[0_0_40px_rgba(45,212,191,0.15)] scale-[1.02]' 
          : 'bg-[#0f172a]/60 border-white/5 hover:border-white/20 shadow-2xl backdrop-blur-xl'
        }
        ${className}
      `}
    >
      {/* Background Flag (Subtle Gradient/Blur) */}
      <div className="absolute inset-0 opacity-5 blur-3xl -z-10 group-hover:opacity-10 transition-opacity">
        <img 
          src={`https://flagcdn.com/w640/${team.iso.toLowerCase()}.png`}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative flex flex-col items-center w-full">
        {/* Main Flag Container */}
        <div className="w-40 h-24 mb-6 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 relative">
          <img 
            src={`https://flagcdn.com/w640/${team.iso.toLowerCase()}.png`}
            alt={`${team.name} flag`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        <span className="text-3xl font-black uppercase tracking-tighter text-white mb-2 leading-none">
          {team.name}
        </span>
        
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-vibrant-teal opacity-80">
           Tap to Win +3PTS
        </span>
      </div>

      {isPicked && (
        <motion.div
           initial={{ scale: 0, rotate: -45 }}
           animate={{ scale: 1, rotate: 0 }}
           className="absolute top-6 right-6 bg-vibrant-teal text-black w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shadow-[0_0_20px_rgba(45,212,191,0.4)] border-2 border-white/20"
        >
          ✓
        </motion.div>
      )}
    </motion.button>
  );
};
