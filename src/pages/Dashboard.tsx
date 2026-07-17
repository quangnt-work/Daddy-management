import { useMemo } from 'react';
import styles from './Dashboard.module.css';
import { useAppData } from '../hooks/useAppData';
import { Award } from 'lucide-react';
import { GiSoccerKick } from 'react-icons/gi';
import MatchCard from '../components/common/MatchCard';
import { getSeasonInfo } from '../utils/seasonUtils';

const Dashboard = () => {
  const { players, matches, loading } = useAppData();

  const { titleText } = getSeasonInfo();

  // 1. Thống kê W-D-L (Chỉ tính trận Đã kết thúc)
  const formStats = useMemo(() => {
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let totalFinished = 0;

    matches.forEach(m => {
      if ((m.status === 'Đã kết thúc' || m.status === 'Kết thúc') && typeof m.our_score === 'number' && typeof m.opponent_score === 'number') {
        totalFinished++;
        if (m.our_score > m.opponent_score) wins++;
        else if (m.our_score === m.opponent_score) draws++;
        else losses++;
      }
    });

    const winPercent = totalFinished > 0 ? (wins / totalFinished) * 100 : 0;
    const drawPercent = totalFinished > 0 ? (draws / totalFinished) * 100 : 0;
    const lossPercent = totalFinished > 0 ? (losses / totalFinished) * 100 : 0;

    return { wins, draws, losses, totalFinished, winPercent, drawPercent, lossPercent };
  }, [matches]);

  // 2. Phong độ gần đây (5 trận gần nhất)
  const recentForm = useMemo(() => {
    const finished = matches.filter(m => (m.status === 'Đã kết thúc' || m.status === 'Kết thúc') && typeof m.our_score === 'number' && typeof m.opponent_score === 'number');
    finished.sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime());

    const last5 = finished.slice(0, 5);
    const formArray: ('W' | 'D' | 'L' | 'empty')[] = last5.map(m => {
      if (m.our_score! > m.opponent_score!) return 'W';
      if (m.our_score! === m.opponent_score!) return 'D';
      return 'L';
    });

    // Đảo ngược mảng để cũ nhất bên trái, mới nhất bên phải, hoặc giữ nguyên tùy ý (thường mới nhất ở phải)
    // Ở đây ta đảo lại để render từ trái qua phải (cũ -> mới)
    const reversed = [...formArray].reverse();
    // Nếu chưa đủ 5 trận, thêm 'empty'
    while (reversed.length < 5) {
      reversed.unshift('empty');
    }
    return reversed;
  }, [matches]);

  // 3. Vua phá lưới (Top 3)
  const top3Scorers = useMemo(() => {
    return [...players]
      .filter(p => p.total_goals && p.total_goals > 0)
      .sort((a, b) => (b.total_goals || 0) - (a.total_goals || 0))
      .slice(0, 3);
  }, [players]);
  const maxGoals = top3Scorers[0]?.total_goals || 1;

  // 4. Trận đấu sắp tới
  const nextMatch = useMemo(() => {
    const upcoming = matches.filter(m => m.status === 'Chưa diễn ra' || m.status === 'Sắp diễn ra');
    upcoming.sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime());
    return upcoming[0] || null;
  }, [matches]);

  if (loading) return <div className={styles.page}>Đang tải dữ liệu...</div>;

  // Tính toán gradient cho Donut chart (Xanh lá -> Xám -> Đỏ)
  const winAngle = formStats.totalFinished > 0 ? (formStats.wins / formStats.totalFinished) * 360 : 0;
  const drawAngle = formStats.totalFinished > 0 ? (formStats.draws / formStats.totalFinished) * 360 : 0;

  const conicGradient = formStats.totalFinished > 0
    ? `conic-gradient(#2E7D32 0deg ${winAngle}deg, #9E9E9E ${winAngle}deg ${winAngle + drawAngle}deg, #C62828 ${winAngle + drawAngle}deg 360deg)`
    : `conic-gradient(var(--bg-secondary) 0deg 360deg)`;

  return (
    <div className={styles.page}>

      {/* HEADER TỔNG QUAN */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{titleText}</h1>
          <p className={styles.subtitle}>
            Cập nhật:{' '}
            {new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })},{' '}
            {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </header>

      <div className={styles.dashboardGrid}>

        {/* ================= CỘT TRÁI (LEFT COL) ================= */}
        <div className={styles.leftCol}>

          {/* TRẬN ĐẤU TIẾP THEO */}
          {nextMatch ? (
            <MatchCard match={nextMatch} isDashboardCard={true} seasonBadgeText={getSeasonInfo(nextMatch.match_date).seasonBadgeText} />
          ) : (
            <div className={styles.card} style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ color: 'var(--text-secondary)' }}>Chưa có lịch thi đấu tiếp theo</div>
            </div>
          )}

          {/* THỐNG KÊ TỈ LỆ (LAPTOP ONLY) */}
          <div className={`${styles.card} ${styles.donutCard}`}>
            <div className={styles.donutChartWrapper}>
              <div className={styles.donutChart} style={{ background: conicGradient }}></div>
              <div className={styles.donutInner}>
                <div className={styles.donutPercent}>{Math.round(formStats.winPercent)}%</div>
                <div className={styles.donutLabel}>Tỉ lệ thắng</div>
              </div>
            </div>

            <div className={styles.donutLegend}>
              <div className={styles.legendItem}>
                <div className={styles.legendDot} style={{ backgroundColor: '#2E7D32' }}></div>
                <span>Thắng: {formStats.wins} trận</span>
              </div>
              <div className={styles.legendItem}>
                <div className={styles.legendDot} style={{ backgroundColor: '#9E9E9E' }}></div>
                <span>Hòa: {formStats.draws} trận</span>
              </div>
              <div className={styles.legendItem}>
                <div className={styles.legendDot} style={{ backgroundColor: '#C62828' }}></div>
                <span>Thua: {formStats.losses} trận</span>
              </div>
            </div>
          </div>

          {/* THÀNH TÍCH ĐỘI (MOBILE ONLY) */}
          <div className={`${styles.card} ${styles.mobileStatsCard}`}>
            <h3 className={styles.cardTitle} style={{ marginBottom: '16px' }}>Thành Tích Đội</h3>
            <div className={styles.mobileStatsGrid}>
              <div className={styles.mobileStatBox}>
                <div className={`${styles.mobileStatNumber} ${styles.win}`}>{formStats.wins}</div>
                <div className={styles.mobileStatLabel}>Thắng</div>
              </div>
              <div className={styles.mobileStatBox}>
                <div className={`${styles.mobileStatNumber} ${styles.draw}`}>{formStats.draws}</div>
                <div className={styles.mobileStatLabel}>Hòa</div>
              </div>
              <div className={styles.mobileStatBox}>
                <div className={`${styles.mobileStatNumber} ${styles.loss}`}>{formStats.losses}</div>
                <div className={styles.mobileStatLabel}>Thua</div>
              </div>
            </div>
            <div className={styles.mobileProgressBar}>
              <div style={{ width: `${formStats.winPercent}%`, backgroundColor: '#2E7D32' }}></div>
              <div style={{ width: `${formStats.drawPercent}%`, backgroundColor: '#9E9E9E' }}></div>
              <div style={{ width: `${formStats.lossPercent}%`, backgroundColor: '#C62828' }}></div>
            </div>
          </div>

        </div>

        {/* ================= CỘT PHẢI (RIGHT COL) ================= */}
        <div className={styles.rightCol}>

          {/* PHONG ĐỘ GẦN ĐÂY */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Phong Độ Gần Đây</h3>
            </div>
            <div className={styles.recentFormRow}>
              {recentForm.map((result, i) => (
                <div key={i} className={`${styles.formCircle} ${styles[result]}`}>
                  {result !== 'empty' ? result : '-'}
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '12px' }}>
              5 trận gần nhất (Trái sang phải: cũ đến mới)
            </div>
          </div>

          {/* VUA PHÁ LƯỚI TOP 3 */}
          <div className={styles.card} style={{ flex: 1 }}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Vua Phá Lưới</h3>
              <Award size={20} color="#FBBF24" />
            </div>

            <div className={styles.scorersList}>
              {top3Scorers.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Chưa có dữ liệu.</div>
              ) : (
                top3Scorers.map((p, index) => {
                  const progressWidth = `${((p.total_goals || 0) / maxGoals) * 100}%`;
                  return (
                    <div key={p.id} className={styles.scorerRow}>
                      <div className={styles.scorerAvatar}>
                        <div className={styles.avatarImage}>
                          {p.full_name.substring(0, 1).toUpperCase()}
                        </div>
                        <div className={`${styles.rankBadgeSmall} ${styles[`rank${index + 1}`]}`} title={`Top ${index + 1}`}>
                          <GiSoccerKick color="#000" size={14} />
                        </div>
                      </div>

                      <div className={styles.scorerInfo}>
                        <div className={styles.scorerHeader}>
                          <div className={styles.scorerName}>{p.full_name}</div>
                          <div className={styles.scorerGoals}>
                            {p.total_goals}
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>Bàn</span>
                          </div>
                        </div>
                        <div className={styles.scorerBarContainer}>
                          <div className={styles.scorerBarFill} style={{ width: progressWidth }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
