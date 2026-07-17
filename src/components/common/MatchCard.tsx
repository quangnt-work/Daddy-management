import { useState, useEffect, useRef } from 'react';
import { Trash2, MoreHorizontal, Edit } from 'lucide-react';
import styles from './MatchCard.module.css';
import type { Match } from '../../hooks/useAppData';

interface MatchCardProps {
  match: Match;
  isDashboardCard?: boolean; // If true, it's the next match on dashboard (different badge text/icon)
  onConfirmMatch?: (match: Match) => void;
  onDeleteMatch?: (match: Match) => void;
  onEditMatch?: (match: Match) => void;
  seasonBadgeText: string;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, isDashboardCard, onConfirmMatch, onDeleteMatch, onEditMatch, seasonBadgeText }) => {
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const isHome = match.is_home;
  const homeTeam = isHome ? 'FC Daddies' : match.opponent;
  const awayTeam = isHome ? match.opponent : 'FC Daddies';
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
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div className={statusClass}>
              🔥 {statusText}
            </div>
          </div>
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
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {dynamicStatus === 'Kết thúc' && !isDashboardCard && onConfirmMatch && (
            <button
              onClick={() => onConfirmMatch(match)}
              className={styles.confirmBtn}
            >
              Xác nhận
            </button>
          )}
          {dynamicStatus !== 'Kết thúc' && (onDeleteMatch || onEditMatch) && (
            <div style={{ position: 'relative' }} ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenu(!openMenu);
                }}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                title="Tùy chọn"
              >
                <MoreHorizontal size={20} />
              </button>
              {openMenu && (
                <div className={styles.dropdownMenu} style={{ top: 'auto', bottom: '100%', right: '0', marginBottom: '8px' }}>
                  {onEditMatch && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpenMenu(false); onEditMatch(match); }}
                      className={styles.menuItem}
                    >
                      <Edit size={14} /> Chỉnh sửa
                    </button>
                  )}
                  {onDeleteMatch && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpenMenu(false); onDeleteMatch(match); }}
                      className={`${styles.menuItem} ${styles.menuItemDanger}`}
                    >
                      <Trash2 size={14} /> Xóa
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
