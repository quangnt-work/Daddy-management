import { useState } from 'react';
import styles from './History.module.css';
import { useAppData } from '../hooks/useAppData';
import { MapPin, Target, ChevronDown } from 'lucide-react';
import { getSeasonInfo } from '../utils/seasonUtils';

const History = () => {
  const { matches, matchGoals, loading } = useAppData();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedIds(newSet);
  };

  if (loading) return <div className={styles.page}>Đang tải...</div>;

  const pastMatches = matches.filter(m => m.status === 'Đã kết thúc' || m.status === 'Kết thúc');

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Lịch sử đấu</h1>
      </header>

      <div className={styles.list}>
        {pastMatches.length === 0 && (
          <div style={{ color: 'var(--text-secondary)' }}>Chưa có dữ liệu lịch sử đấu</div>
        )}
        {pastMatches.map((match) => {
          const isWin = match.our_score > match.opponent_score;
          const isLoss = match.our_score < match.opponent_score;
          const isExpanded = expandedIds.has(match.id);

          // Nhóm cầu thủ ghi bàn
          const scorers = matchGoals.filter(g => g.match_id === match.id);
          const groupedScorers = scorers.reduce((acc, goal) => {
            const name = goal.players?.full_name?.split(' ').pop() || 'Unknown';
            acc[name] = (acc[name] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          const matchDate = new Date(match.match_date).toLocaleDateString('vi-VN');

          return (
            <div key={match.id} className={styles.matchCard}>

              <div className={styles.cardTop} onClick={() => toggleExpand(match.id)}>
                <div className={styles.cardHeader}>
                  <span className={styles.date}>{matchDate}</span>
                  <span className={styles.matchTypeBadge}>{getSeasonInfo(match.match_date).seasonBadgeText}</span>
                </div>

                <div className={styles.scoreSection}>
                  <div className={styles.teamBlock}>
                    <div className={`${styles.teamLogo} ${styles.homeLogo}`}>D</div>
                    <span className={styles.teamName}>FC DADDIES</span>
                  </div>

                  <div className={styles.scoreDisplay}>
                    <span className={isWin ? styles.scoreWin : (isLoss ? styles.scoreLoss : '')}>{match.our_score}</span>
                    <span className={styles.divider}>-</span>
                    <span className={isLoss ? styles.scoreWin : (isWin ? styles.scoreLoss : '')}>{match.opponent_score}</span>
                  </div>

                  <div className={styles.teamBlock}>
                    <div className={`${styles.teamLogo} ${styles.awayLogo}`}>
                      {match.opponent.charAt(0).toUpperCase()}
                    </div>
                    <span className={styles.teamName}>{match.opponent}</span>
                  </div>
                </div>

                <ChevronDown
                  size={20}
                  className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}
                />
              </div>

              <div className={`${styles.cardBottomWrapper} ${isExpanded ? styles.expanded : ''}`}>
                <div className={styles.cardBottomInner}>
                  <div className={styles.cardBottom}>
                    <div className={styles.locationRow}>
                      <MapPin size={16} />
                      <span>Sân vận động {match.stadium}</span>
                    </div>

                    {scorers.length > 0 && (
                      <div className={styles.scorersBox}>
                        <div className={styles.scorersTitle}>Ghi bàn (FC Daddy)</div>
                        {Object.entries(groupedScorers).map(([name, count], idx) => (
                          <div key={idx} className={styles.scorerRow}>
                            <div className={styles.scorerLeft}>
                              <Target size={14} />
                              <span>{name}</span>
                            </div>
                            <span>{count} bàn</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {match.highlight_urls && match.highlight_urls.length > 0 && (
                      <div style={{ marginTop: '16px' }}>
                        <div className={styles.scorersTitle}>Highlight Trận đấu</div>
                        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
                          {match.highlight_urls.map((url, idx) => (
                            <video
                              key={idx}
                              src={url}
                              controls
                              style={{ height: '200px', borderRadius: '8px', flexShrink: 0, backgroundColor: '#000' }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default History;
