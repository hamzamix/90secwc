import React from 'react';
import { ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TeamStat {
  teamId: string;
  name: string;
  flag: string;
  iso: string;
  wins: number;
}

export const GlobalChampions: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [stats, setStats] = React.useState<TeamStat[]>([]);
  const [totalSimulations, setTotalSimulations] = React.useState(0);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        setStats(data);
        const total = data.reduce((acc: number, curr: TeamStat) => acc + curr.wins, 0);
        setTotalSimulations(total);
      } catch (err) {
        console.error("Global stats fetch failed", err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-lg bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-8 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex flex-col items-start">
          <h2 className="text-2xl font-black uppercase tracking-tighter">Global Champions</h2>
          <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-black">See who others crowned</p>
        </div>
        {isOpen ? <ChevronUp /> : <ChevronDown />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-8 pt-0 space-y-4 max-h-[400px] overflow-y-auto">
              <div className="text-center pb-4 border-b border-white/5 mb-4">
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                  {totalSimulations} tournaments completed worldwide
                </span>
              </div>
              
              {stats.map((stat, idx) => {
                const percentage = totalSimulations > 0 ? (stat.wins / totalSimulations) * 100 : 0;
                
                return (
                  <div key={stat.teamId} className="space-y-1.5 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-white/20 w-4">{idx + 1}</span>
                        <div className="w-8 h-5 rounded overflow-hidden border border-white/10">
                          <img src={`https://flagcdn.com/w80/${stat.iso?.toLowerCase() || 'un'}.png`} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-black uppercase tracking-tighter text-sm group-hover:text-world-cup transition-colors">
                          {stat.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {idx === 0 && <Trophy className="w-3 h-3 text-world-cup" />}
                        <span className="font-mono font-black text-sm">{stat.wins}</span>
                      </div>
                    </div>
                    {/* Progress Bar Container */}
                    <div className="pl-12 pr-4">
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, ease: "easeOut", delay: idx * 0.05 }}
                          className="h-full bg-world-cup shadow-[0_0_8px_rgba(250,204,21,0.4)]"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {stats.length === 0 && (
                <div className="py-12 text-center text-white/20">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">Awaiting first records...</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
