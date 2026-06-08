import { Team, TEAMS } from "../data/teams";
import { Match, GroupStanding } from "../types";
import { shuffle, chunk } from "lodash";

const FIXED_GROUPS: Record<string, string[]> = {
  A: ["MEX", "ECU", "SEN", "QAT"],
  B: ["CAN", "CRO", "GHA", "IRN"],
  C: ["BRA", "MAR", "HAI", "SCO"],
  D: ["USA", "DEN", "CIV", "AUS"],
  E: ["ARG", "AUT", "EGY", "JPN"],
  F: ["FRA", "SUI", "ALG", "IRQ"],
  G: ["ESP", "TUR", "TUN", "PAN"],
  H: ["ENG", "BEL", "UKR", "KSA"],
  I: ["POR", "COL", "CMR", "UZB"],
  J: ["NED", "PER", "JAM", "NZL"],
  K: ["GER", "POL", "URU", "KOR"],
  L: ["GEO", "CRC", "NOR", "SWE"],
};

export function initializeGroups(): Record<string, Team[]> {
  const groups: Record<string, Team[]> = {};
  
  Object.entries(FIXED_GROUPS).forEach(([name, ids]) => {
    groups[name] = ids.map(id => TEAMS.find(t => t.id === id)!).filter(Boolean);
  });
  
  return groups;
}

export function generateGroupMatches(groups: Record<string, Team[]>): Match[] {
  const matches: Match[] = [];
  
  Object.entries(groups).forEach(([groupName, teams]) => {
    // Round robin for each group
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        matches.push({
          id: `group-${groupName}-${i}-${j}`,
          homeTeam: teams[i],
          awayTeam: teams[j],
          winnerId: null,
          isDraw: false,
          stage: 'group',
          group: groupName
        });
      }
    }
  });
  
  // Randomize the challenge order
  return shuffle(matches);
}

export function calculateStandings(groupName: string, teams: Team[], matches: Match[]): GroupStanding[] {
  const groupMatches = matches.filter(m => m.group === groupName && (m.winnerId !== null || m.isDraw));
  
  const standings: Record<string, GroupStanding> = {};
  teams.forEach(t => {
    standings[t.id] = { teamId: t.id, played: 0, won: 0, drawn: 0, lost: 0, pts: 0, gf: 0, ga: 0 };
  });
  
  groupMatches.forEach(m => {
    const home = standings[m.homeTeam.id];
    const away = standings[m.awayTeam.id];
    
    home.played++;
    away.played++;
    
    if (m.isDraw) {
      home.drawn++;
      away.drawn++;
      home.pts += 1;
      away.pts += 1;
    } else if (m.winnerId === m.homeTeam.id) {
      home.won++;
      away.lost++;
      home.pts += 3;
    } else {
      away.won++;
      home.lost++;
      away.pts += 3;
    }
    
    if (m.isDraw) {
      home.gf += 1; home.ga += 1;
      away.gf += 1; away.ga += 1;
    } else if (m.winnerId === m.homeTeam.id) {
      home.gf += 1; away.ga += 1;
    } else {
      away.gf += 1; home.ga += 1;
    }
  });
  
  return Object.values(standings).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    return (b.gf - b.ga) - (a.gf - a.ga); // Goal difference
  });
}

export interface KnockoutTeams {
  groupWinners: Record<string, Team>;
  groupRunnersUp: Record<string, Team>;
  bestThirds: Team[];
}

export function getKnockoutTeamsData(groups: Record<string, Team[]>, allMatches: Match[]): KnockoutTeams {
  const groupWinners: Record<string, Team> = {};
  const groupRunnersUp: Record<string, Team> = {};
  const thirdPlaced: { team: Team, pts: number, gd: number }[] = [];
  
  Object.entries(groups).forEach(([groupName, teams]) => {
    const st = calculateStandings(groupName, teams, allMatches);
    if (st[0]) groupWinners[groupName] = TEAMS.find(t => t.id === st[0].teamId)!;
    if (st[1]) groupRunnersUp[groupName] = TEAMS.find(t => t.id === st[1].teamId)!;
    if (st[2]) {
      thirdPlaced.push({
        team: TEAMS.find(t => t.id === st[2].teamId)!,
        pts: st[2].pts,
        gd: st[2].gf - st[2].ga
      });
    }
  });
  
  const bestThirds = thirdPlaced.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    return b.gd - a.gd;
  }).slice(0, 8).map(x => x.team);
  
  return { groupWinners, groupRunnersUp, bestThirds };
}
