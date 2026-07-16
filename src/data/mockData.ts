export const MOCK_PLAYERS = [
  { id: '1', name: 'Nguyễn Văn A', number: 1, position: 'Thủ môn', goals: 0, minutes: 1250, avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'Trần Văn B', number: 4, position: 'Hậu vệ', goals: 1, minutes: 1100, avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'Lê Văn C', number: 5, position: 'Hậu vệ', goals: 2, minutes: 1200, avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: '4', name: 'Phạm Văn D', number: 8, position: 'Tiền vệ', goals: 5, minutes: 950, avatar: 'https://i.pravatar.cc/150?u=4' },
  { id: '5', name: 'Hoàng Văn E', number: 10, position: 'Tiền đạo', goals: 12, minutes: 1150, avatar: 'https://i.pravatar.cc/150?u=5' },
];

export const MOCK_SCHEDULE = [
  { id: '1', date: '2024-11-20T18:00:00Z', opponent: 'FC Ruby', stadium: 'Sân Mỹ Đình', isHome: true },
  { id: '2', date: '2024-11-27T17:30:00Z', opponent: 'FC Diamond', stadium: 'Sân Hàng Đẫy', isHome: false },
];

export const MOCK_HISTORY = [
  { 
    id: '1', 
    date: '2024-11-10T18:00:00Z', 
    opponent: 'FC Sapphire', 
    ourScore: 2, 
    opponentScore: 1, 
    scorers: [{ name: 'Hoàng Văn E', minute: 45 }, { name: 'Phạm Văn D', minute: 78 }]
  },
  { 
    id: '2', 
    date: '2024-11-03T18:00:00Z', 
    opponent: 'FC Emerald', 
    ourScore: 0, 
    opponentScore: 0, 
    scorers: []
  },
];
