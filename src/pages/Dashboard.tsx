import styles from './Dashboard.module.css';
import { useAppData } from '../hooks/useAppData';

const Dashboard = () => {
  const { players, matches, loading } = useAppData();

  if (loading) return <div className={styles.page}>Đang tải...</div>;

  const totalGoals = players.reduce((sum, p) => sum + (p.total_goals || 0), 0);
  const nextMatch = matches.find(m => m.status === 'Sắp diễn ra') || matches[0];
  
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Tổng quan mùa giải</h1>
        <p className={styles.subtitle}>Chào mừng trở lại! Dưới đây là tóm tắt tình hình đội bóng.</p>
      </header>

      <div className={styles.grid}>
        <div className={`glass-panel ${styles.card}`}>
          <h3 className={styles.cardTitle}>Số Cầu Thủ</h3>
          <div className={styles.statValue}>{players.length}</div>
        </div>
        <div className={`glass-panel ${styles.card}`}>
          <h3 className={styles.cardTitle}>Tổng Bàn Thắng</h3>
          <div className={styles.statValue}>{totalGoals}</div>
        </div>
        <div className={`glass-panel ${styles.card}`}>
          <h3 className={styles.cardTitle}>Trận Đấu Tới</h3>
          <div className={styles.statValue} style={{ fontSize: '1.5rem' }}>
            {nextMatch ? nextMatch.opponent : 'Không có'}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {nextMatch ? new Date(nextMatch.match_date).toLocaleDateString('vi-VN') : ''}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
