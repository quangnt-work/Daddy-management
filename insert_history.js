import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

async function insertMatchData() {
  console.log('Inserting match...');
  
  // 1. Get the match we just inserted (or insert if not exists)
  let { data: matchData, error: matchError } = await supabase
    .from('matches')
    .select('id')
    .eq('opponent', 'FC test 1')
    .single();

  if (!matchData) {
    const { data: newMatch } = await supabase
      .from('matches')
      .insert([
        {
          opponent: 'FC test 1',
          stadium: 'Tuấn phong',
          match_date: '2026-07-15T14:00:00Z',
          is_home: true,
          status: 'Đã kết thúc',
          our_score: 10,
          opponent_score: 3,
          season: '2026'
        }
      ])
      .select()
      .single();
    matchData = newMatch;
  }

  if (matchError) {
    console.error('Error inserting match:', matchError);
    return;
  }
  
  const matchId = matchData.id;
  console.log('Match inserted with ID:', matchId);

  // 2. Insert or get Players (Quang, Quân, Khải, Lâm)
  const playerNames = ['Quang', 'Quân', 'Khải', 'Lâm'];
  const playerIds = {};

  for (const name of playerNames) {
    // Check if exists
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
  // Quang (2), Quân (2), Khải (3), Lâm (3)
  const goalCounts = {
    'Quang': 2,
    'Quân': 2,
    'Khải': 3,
    'Lâm': 3
  };

  const goalsToInsert = [];
  
  for (const [name, count] of Object.entries(goalCounts)) {
    const playerId = playerIds[name];
    if (playerId) {
      for (let i = 0; i < count; i++) {
        goalsToInsert.push({
          match_id: matchId,
          player_id: playerId,
          minute: Math.floor(Math.random() * 90) + 1 // random minute
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
