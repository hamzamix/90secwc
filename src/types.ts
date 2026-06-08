import { Team } from "./data/teams";

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  winnerId: string | null; // null for draw
  isDraw: boolean;
  stage: 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'final';
  group?: string;
}

export interface GroupStanding {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  pts: number;
  gf: number;
  ga: number;
}

export type GameState = 'start' | 'group' | 'knockout' | 'win' | 'loss';

export interface LeaderboardEntry {
  userId: string;
  name: string;
  wins: number;
  updatedAt: any;
}
