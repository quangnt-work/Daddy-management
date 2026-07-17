import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Player {
  id: string;
  full_name: string;
  jersey_number: number;
  position: string;
  roles?: string[];
  total_goals: number;
  total_minutes: number;
  avatar_url: string;
}

export interface Match {
  id: string;
  opponent: string;
  opponent_logo: string;
  match_date: string;
  stadium: string;
  is_home: boolean;
  status: string;
  our_score: number;
  opponent_score: number;
  season: string;
  highlight_urls?: string[];
}

export interface MatchGoal {
  id: string;
  match_id: string;
  player_id: string;
  minute: number;
  players: { full_name: string };
}

export interface TeamOfSeasonSlot {
  id: string;
  season: string;
  player_id: string;
  slot: string;
  formation: string;
  created_at: string;
  players: Player; // joined from FK
}

export const useAppData = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchGoals, setMatchGoals] = useState<MatchGoal[]>([]);
  const [teamOfSeason, setTeamOfSeason] = useState<TeamOfSeasonSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [playersRes, matchesRes, goalsRes, teamRes] = await Promise.all([
        supabase.from('players').select('*').order('jersey_number', { ascending: true }),
        supabase.from('matches').select('*').order('match_date', { ascending: false }),
        supabase.from('match_goals').select('*, players(full_name)'),
        supabase.from('team_of_season').select('*, players(*)'),
      ]);

      if (playersRes.data) setPlayers(playersRes.data);
      if (matchesRes.data) setMatches(matchesRes.data);
      if (goalsRes.data) setMatchGoals(goalsRes.data);
      if (teamRes.data) setTeamOfSeason(teamRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { players, matches, matchGoals, teamOfSeason, loading, refetch: fetchData };
};
