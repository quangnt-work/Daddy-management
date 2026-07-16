import { useState } from 'react';
import { Plus } from 'lucide-react';
import styles from './Squad.module.css';
import { useAppData } from '../hooks/useAppData';
import Modal from '../components/common/Modal';
import { supabase } from '../lib/supabase';

const Squad = () => {
  const { players, loading, refetch } = useAppData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    jersey_number: '',
    position: 'Tiền đạo',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.jersey_number) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('players').insert([
        {
          full_name: formData.full_name,
          jersey_number: parseInt(formData.jersey_number),
          position: formData.position,
        }
      ]);

      if (error) {
        alert('Lỗi khi thêm cầu thủ: ' + error.message);
      } else {
        setIsModalOpen(false);
        setFormData({ full_name: '', jersey_number: '', position: 'Tiền đạo' });
        refetch(); // Tải lại danh sách
      }
    } catch (err) {
      console.error(err);
      alert('Đã có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && players.length === 0) return <div className={styles.page}>Đang tải...</div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Đội hình</h1>
        <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          <span>Thêm cầu thủ</span>
        </button>
      </header>

      <div className={styles.grid}>
        {players.map((player) => {
          let posShort = 'CB';
          if (player.position === 'Thủ môn') posShort = 'GK';
          else if (player.position === 'Hậu vệ') posShort = 'DF';
          else if (player.position === 'Tiền vệ') posShort = 'MF';
          else if (player.position === 'Tiền đạo') posShort = 'FW';

          return (
            <div key={player.id} className={styles.card}>
              <div className={styles.imageContainer}>
                {/* Thay thế ảnh cầu thủ bằng Logo (Initials) */}
                <img 
                  src={`https://ui-avatars.com/api/?name=${player.full_name}&background=10B981&color=fff&size=120&bold=true`} 
                  alt={player.full_name} 
                  className={styles.avatar} 
                />
              </div>
              
              <div className={styles.infoContainer}>
                <div className={styles.headerRow}>
                  <div className={styles.name}>{player.full_name}</div>
                  <div className={styles.positionBadge}>{posShort}</div>
                </div>
                
                <div className={styles.subtext}>
                  {player.position} &bull; #{player.jersey_number}
                </div>
                
                <div className={styles.statsRow}>
                  <div className={styles.statColumn}>
                    <span className={styles.statLabel}>Số phút</span>
                    <span className={styles.statValue}>{player.total_minutes?.toLocaleString() || '0'}</span>
                  </div>
                  <div className={styles.statColumn}>
                    <span className={styles.statLabel}>Bàn thắng</span>
                    <span className={styles.statValue}>{player.total_goals || '0'}</span>
                  </div>
                </div>
              </div>

              {/* Watermark Logo bên phải */}
              <div className={styles.watermark}>
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
            </div>
          );
        })}
        {players.length === 0 && <div style={{ color: 'var(--text-secondary)' }}>Chưa có dữ liệu cầu thủ.</div>}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className={styles.modalTitle}>Thêm Cầu Thủ Mới</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Họ và Tên</label>
            <input 
              type="text" 
              placeholder="VD: Nguyễn Văn A"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              required 
            />
          </div>
          <div className={styles.formGroup}>
            <label>Số Áo</label>
            <input 
              type="number" 
              placeholder="VD: 10"
              value={formData.jersey_number}
              onChange={(e) => setFormData({...formData, jersey_number: e.target.value})}
              required 
            />
          </div>
          <div className={styles.formGroup}>
            <label>Vị trí</label>
            <select 
              value={formData.position}
              onChange={(e) => setFormData({...formData, position: e.target.value})}
            >
              <option value="Thủ môn">Thủ môn</option>
              <option value="Hậu vệ">Hậu vệ</option>
              <option value="Tiền vệ">Tiền vệ</option>
              <option value="Tiền đạo">Tiền đạo</option>
            </select>
          </div>
          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? 'Đang thêm...' : 'Lưu cầu thủ'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Squad;
