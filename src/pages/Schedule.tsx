import { useState } from 'react';
import { Plus } from 'lucide-react';
import styles from './Schedule.module.css';
import { useAppData } from '../hooks/useAppData';
import type { Match } from '../hooks/useAppData';
import Modal from '../components/common/Modal';
import { ConfirmMatchModal } from '../components/ConfirmMatchModal';
import MatchCard from '../components/common/MatchCard';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { getSeasonInfo } from '../utils/seasonUtils';

// Helper function to get next Wednesday at 21:00
const getNextWednesday21h = () => {
  const d = new Date();
  const day = d.getDay(); // 0 = Sun, 1 = Mon, ..., 3 = Wed
  let daysUntilWed = 3 - day;

  if (daysUntilWed < 0 || (daysUntilWed === 0 && d.getHours() >= 21)) {
    daysUntilWed += 7;
  }

  d.setDate(d.getDate() + daysUntilWed);
  d.setHours(21, 0, 0, 0);

  // Format for datetime-local: YYYY-MM-DDTHH:mm
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
};

const Schedule = () => {
  const { matches, players, loading, refetch } = useAppData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmMatch, setConfirmMatch] = useState<Match | null>(null);
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);



  // Form State
  const [formData, setFormData] = useState({
    opponent: '',
    stadium: 'Tuấn Phong',
    match_date: getNextWednesday21h(),
    is_home: true,
  });

  const upcomingMatches = matches.filter(m => m.status !== 'Đã kết thúc');

  const openAddModal = () => {
    setEditingMatchId(null);
    setFormData({
      opponent: '',
      stadium: 'Tuấn Phong',
      match_date: getNextWednesday21h(),
      is_home: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (match: Match) => {
    setEditingMatchId(match.id);

    // Convert match_date to local datetime-local format
    const d = new Date(match.match_date);
    const offset = d.getTimezoneOffset() * 60000;
    const localIso = new Date(d.getTime() - offset).toISOString().slice(0, 16);

    setFormData({
      opponent: match.opponent,
      stadium: match.stadium,
      match_date: localIso,
      is_home: match.is_home,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.opponent || !formData.match_date) return;

    setIsSubmitting(true);
    try {
      const dateObject = new Date(formData.match_date);
      const { seasonValue: newSeasonValue } = getSeasonInfo(dateObject);

      if (editingMatchId) {
        // Edit mode
        const { error } = await supabase.from('matches').update({
          opponent: formData.opponent,
          stadium: formData.stadium,
          match_date: dateObject.toISOString(),
          is_home: formData.is_home,
          season: newSeasonValue
        }).eq('id', editingMatchId);

        if (error) {
          toast.error('Lỗi khi cập nhật lịch đấu: ' + error.message);
        } else {
          toast.success('Cập nhật lịch đấu thành công!');
          setIsModalOpen(false);
          refetch(); // Reload data
        }
      } else {
        // Add mode
        const { error } = await supabase.from('matches').insert([
          {
            opponent: formData.opponent,
            stadium: formData.stadium,
            match_date: dateObject.toISOString(),
            is_home: formData.is_home,
            status: 'Sắp diễn ra',
            season: newSeasonValue
          }
        ]);

        if (error) {
          toast.error('Lỗi khi thêm lịch đấu: ' + error.message);
        } else {
          toast.success('Thêm lịch đấu thành công!');
          setIsModalOpen(false);
          refetch(); // Reload data
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Đã có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMatch = (matchToDelete: Match) => {
    toast(`Bạn có chắc muốn xóa trận đấu với ${matchToDelete.opponent}?`, {
      action: {
        label: 'Xóa',
        onClick: async () => {
          try {
            const { error } = await supabase.from('matches').delete().eq('id', matchToDelete.id);
            if (error) {
              toast.error('Lỗi khi xóa trận đấu: ' + error.message);
            } else {
              toast.success('Xóa trận đấu thành công!');
              refetch();
            }
          } catch (err) {
            console.error(err);
            toast.error('Đã có lỗi xảy ra');
          }
        }
      },
      cancel: {
        label: 'Hủy',
        onClick: () => { }
      }
    });
  };

  if (loading) return <div className={styles.page}>Đang tải...</div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Lịch thi đấu</h1>
        <button className={styles.addButton} onClick={openAddModal}>
          <Plus size={20} />
          <span>Thêm lịch đấu</span>
        </button>
      </header>

      <div className={styles.list}>
        {upcomingMatches.length === 0 && (
          <div style={{ color: 'var(--text-secondary)' }}>Chưa có lịch thi đấu mới</div>
        )}
        {upcomingMatches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            seasonBadgeText={getSeasonInfo(match.match_date).seasonBadgeText}
            onConfirmMatch={setConfirmMatch}
            onDeleteMatch={handleDeleteMatch}
            onEditMatch={openEditModal}
          />
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className={styles.modalTitle}>{editingMatchId ? 'Chỉnh sửa Lịch Đấu' : 'Thêm Lịch Đấu Mới'}</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Đối thủ</label>
            <input
              type="text"
              placeholder="VD: FC ..."
              value={formData.opponent}
              onChange={(e) => setFormData({ ...formData, opponent: e.target.value })}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Thời gian</label>
            <input
              type="datetime-local"
              value={formData.match_date}
              onChange={(e) => setFormData({ ...formData, match_date: e.target.value })}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Sân vận động</label>
            <input
              type="text"
              placeholder="VD: Sân Mỹ Đình"
              value={formData.stadium}
              onChange={(e) => setFormData({ ...formData, stadium: e.target.value })}
              required
            />
          </div>
          <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="is_home"
              checked={formData.is_home}
              onChange={(e) => setFormData({ ...formData, is_home: e.target.checked })}
              className={styles.checkbox}
            />
            <label htmlFor="is_home" style={{ cursor: 'pointer', margin: 0 }}>Đá sân nhà</label>
          </div>
          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : (editingMatchId ? 'Lưu thay đổi' : 'Lưu lịch đấu')}
          </button>
        </form>
      </Modal>

      <ConfirmMatchModal
        isOpen={!!confirmMatch}
        onClose={() => setConfirmMatch(null)}
        match={confirmMatch}
        players={players}
        onSuccess={() => {
          setConfirmMatch(null);
          refetch(); // Reload data -> Match will disappear from Schedule and appear in History
        }}
      />
    </div>
  );
};

export default Schedule;
