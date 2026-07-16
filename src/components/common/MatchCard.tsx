import React from 'react';
import styles from './MatchCard.module.css';
import type { Match } from '../../hooks/useAppData';

interface MatchCardProps {
  match: Match;
  isDashboardCard?: boolean; // If true, it's the next match on dashboard (different badge text/icon)
  onConfirmMatch?: (match: Match) => void;
  seasonBadgeText: string;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, isDashboardCard, onConfirmMatch, seasonBadgeText }) => {
  const isHome = match.is_home;
  const homeTeam = isHome ? 'FC Daddy' : match.opponent;
  const awayTeam = isHome ? match.opponent : 'FC Daddy';
  const matchDate = new Date(match.match_date);
  const timeString = matchDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  // Status Logic
  const getDynamicStatus = (matchDateStr: string) => {
    const matchDate = new Date(matchDateStr).getTime();
    const now = new Date().getTime();
    if (now < matchDate) return 'Chưa diễn ra';
    if (now >= matchDate && now < matchDate + 90 * 60000) return 'Đang diễn ra'; // +90 mins
    return 'Kết thúc';
  };

  const dynamicStatus = getDynamicStatus(match.match_date);
  let statusClass = styles.matchBadge;
  let statusText = 'Chưa diễn ra';
  if (dynamicStatus === 'Đang diễn ra') {
    statusClass = `${styles.matchBadge} ${styles.matchBadgeLive}`;
    statusText = 'Đang diễn ra';
  } else if (dynamicStatus === 'Kết thúc') {
    statusClass = `${styles.matchBadge} ${styles.matchBadgeFinished}`;
    statusText = 'Kết thúc';
  }

  // Override status for Dashboard
  if (isDashboardCard) {
    statusClass = styles.matchBadge;
    statusText = 'Trận cầu tâm điểm';
  }

  return (
    <div className={styles.matchCard}>
      {/* Header */}
      <div className={styles.matchHeader}>
        <div className={statusClass}>
          🔥 {statusText}
        </div>
        <div className={styles.matchLeague}>{seasonBadgeText}</div>
      </div>

      {/* Body */}
      <div className={styles.matchBody}>
        <div className={styles.teamSide}>
          <div className={`${styles.teamLogo} ${isHome ? styles.homeLogo : styles.awayLogo}`}>
            {isHome ? 'HOME' : 'AWAY'}
          </div>
          <div className={styles.teamName}>{homeTeam}</div>
        </div>

        <div className={styles.matchCenter}>
          <div className={styles.matchTimeValue}>
            {timeString}
          </div>
          <div className={styles.countdownBoxes}>
            <div className={styles.countdownBox}>
              <div className={styles.countdownValue}>{matchDate.getDate().toString().padStart(2, '0')}</div>
              <div className={styles.countdownLabel}>Ngày</div>
            </div>
            <div className={styles.countdownBox}>
              <div className={styles.countdownValue}>{(matchDate.getMonth() + 1).toString().padStart(2, '0')}</div>
              <div className={styles.countdownLabel}>Tháng</div>
            </div>
          </div>
        </div>

        <div className={styles.teamSide}>
          <div className={`${styles.teamLogo} ${!isHome ? styles.homeLogo : styles.awayLogo}`}>
            {!isHome ? 'HOME' : 'AWAY'}
          </div>
          <div className={styles.teamName}>{awayTeam}</div>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.matchFooter}>
        <span className={styles.stadiumInfo}>🏟 Sân vận động: {match.stadium}</span>
        {dynamicStatus === 'Kết thúc' && !isDashboardCard && onConfirmMatch && (
          <button
            onClick={() => onConfirmMatch(match)}
            className={styles.confirmBtn}
          >
            Xác nhận
          </button>
        )}
      </div>
    </div>
  );
};

export default MatchCard;
