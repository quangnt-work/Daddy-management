import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

async function insertMatchData() {
  console.log('Inserting second match...');
  
  // 1. Get or insert match
  let { data: matchData, error: matchError } = await supabase
    .from('matches')
    .select('id')
    .eq('opponent', 'FC test 2')
    .single();

  if (!matchData) {
    const { data: newMatch } = await supabase
      .from('matches')
      .insert([
        {
          opponent: 'FC test 2',
          stadium: 'Tuấn phong',
          match_date: '2026-07-08T14:00:00Z', // 8/7/2026 21:00 UTC+7 is 14:00 UTC
          is_home: true,
          status: 'Đã kết thúc',
          our_score: 8,
          opponent_score: 2,
          season: '2026'
        }
      ])
      .select()
      .single();
    matchData = newMatch;
  }

  if (matchError && matchError.code !== 'PGRST116') {
    console.error('Error inserting match:', matchError);
    return;
  }
  
  const matchId = matchData.id;
  console.log('Match inserted with ID:', matchId);

  // 2. Insert or get Players (Hanh, Quân, Khải, Lâm)
  const playerNames = ['Hanh', 'Quân', 'Khải', 'Lâm'];
  const playerIds = {};

  for (const name of playerNames) {
    let { data: existingPlayer } = await supabase
      .from('players')
      .select('id')
      .ilike('full_name', `%${name}%`)
      .limit(1)
      .single();

    if (!existingPlayer) {
      console.log(`Player ${name} not found, creating...`);
      const { data: newPlayer, error: newPlayerError } = await supabase
        .from('players')
        .insert([{
          full_name: name,
          jersey_number: Math.floor(Math.random() * 99) + 1,
          position: 'Tiền đạo'
        }])
        .select()
        .single();
      
      if (newPlayerError) {
         console.error('Error creating player:', newPlayerError);
         continue;
      }
      existingPlayer = newPlayer;
    }
    playerIds[name] = existingPlayer.id;
  }

  // 3. Insert Goals
  // Hanh (1), Quân (1), Khải (5), Lâm (1)
  const goalCounts = {
    'Hanh': 1,
    'Quân': 1,
    'Khải': 5,
    'Lâm': 1
  };

  const goalsToInsert = [];
  
  for (const [name, count] of Object.entries(goalCounts)) {
    const playerId = playerIds[name];
    if (playerId) {
      for (let i = 0; i < count; i++) {
        goalsToInsert.push({
          match_id: matchId,
          player_id: playerId,
          minute: Math.floor(Math.random() * 90) + 1
        });
      }
    }
  }

  const { error: goalsError } = await supabase
    .from('match_goals')
    .insert(goalsToInsert);

  if (goalsError) {
    console.error('Error inserting goals:', goalsError);
  } else {
    console.log(`Successfully inserted ${goalsToInsert.length} goals.`);
  }
}

insertMatchData();
