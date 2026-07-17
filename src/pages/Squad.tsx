import { useState, useEffect } from 'react';
import { Plus, Trash2, MoreHorizontal, Edit } from 'lucide-react';
import { toast } from 'sonner';
import styles from './Squad.module.css';
import { useAppData } from '../hooks/useAppData';
import Modal from '../components/common/Modal';
import { supabase } from '../lib/supabase';

const Squad = () => {
  const { players, loading, refetch } = useAppData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);

  const AVAILABLE_ROLES = ["Cầu thủ", "Thủ quỹ", "Chủ tịch", "HLV"];

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    jersey_number: '',
    position: 'Tiền đạo',
    roles: ['Cầu thủ'] as string[],
  });

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleRoleToggle = (role: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role) 
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const openEditModal = (player: any) => {
    setEditingPlayerId(player.id);
    setFormData({
      full_name: player.full_name,
      jersey_number: player.jersey_number?.toString() || '',
      position: player.position,
      roles: player.roles || ['Cầu thủ'],
    });
    setOpenMenuId(null);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingPlayerId(null);
    setFormData({ full_name: '', jersey_number: '', position: 'Tiền đạo', roles: ['Cầu thủ'] });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.jersey_number) return;

    setIsSubmitting(true);
    try {
      if (editingPlayerId) {
        // Edit mode
        const { error } = await supabase.from('players').update({
          full_name: formData.full_name,
          jersey_number: parseInt(formData.jersey_number),
          position: formData.position,
          roles: formData.roles.length > 0 ? formData.roles : ['Cầu thủ'],
        }).eq('id', editingPlayerId);

        if (error) {
          toast.error('Lỗi khi cập nhật cầu thủ: ' + error.message);
        } else {
          toast.success('Cập nhật cầu thủ thành công!');
          setIsModalOpen(false);
          refetch(); // Tải lại danh sách
        }
      } else {
        // Add mode
        const { error } = await supabase.from('players').insert([
          {
            full_name: formData.full_name,
            jersey_number: parseInt(formData.jersey_number),
            position: formData.position,
            roles: formData.roles.length > 0 ? formData.roles : ['Cầu thủ'],
            total_goals: 0,
          }
        ]);

        if (error) {
          toast.error('Lỗi khi thêm cầu thủ: ' + error.message);
        } else {
          toast.success('Thêm cầu thủ thành công!');
          setIsModalOpen(false);
          refetch(); // Tải lại danh sách
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Đã có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlayer = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa cầu thủ ${name}?`)) {
      try {
        const { error } = await supabase.from('players').delete().eq('id', id);
        if (error) {
          toast.error('Lỗi khi xóa cầu thủ: ' + error.message);
        } else {
          toast.success('Xóa cầu thủ thành công!');
          setOpenMenuId(null);
          refetch();
        }
      } catch (err) {
        console.error(err);
        toast.error('Đã có lỗi xảy ra');
      }
    }
  };

  if (loading && players.length === 0) return <div className={styles.page}>Đang tải...</div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Đội hình</h1>
        <button className={styles.addButton} onClick={openAddModal}>
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
                  {player.roles && player.roles.length > 0 && (
                    <div style={{ marginTop: '4px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {player.roles.map(r => (
                        <span key={r} className={styles.roleBadge}>{r}</span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className={styles.statsRow}>
                  <div className={styles.statColumn}>
                    <span className={styles.statLabel}>Bàn thắng</span>
                    <span className={styles.statValue}>{player.total_goals || '0'}</span>
                  </div>
                </div>
              </div>

              {/* Action menu */}
              <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10 }}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === player.id ? null : player.id);
                  }}
                  style={{ background: 'rgba(255, 255, 255, 0.9)', border: 'none', borderRadius: '50%', padding: '6px', cursor: 'pointer', color: '#334155' }}
                  title="Tùy chọn"
                >
                  <MoreHorizontal size={16} />
                </button>

                {openMenuId === player.id && (
                  <div className={styles.dropdownMenu}>
                    <button onClick={() => openEditModal(player)} className={styles.menuItem}>
                      <Edit size={14} /> Chỉnh sửa
                    </button>
                    <button 
                      onClick={() => handleDeletePlayer(player.id, player.full_name)} 
                      className={`${styles.menuItem} ${styles.menuItemDanger}`}
                    >
                      <Trash2 size={14} /> Xóa
                    </button>
                  </div>
                )}
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
          <div className={styles.formGroup}>
            <label>Chức vụ (Có thể chọn nhiều)</label>
            <div className={styles.rolesGrid}>
              {AVAILABLE_ROLES.map(role => (
                <label key={role} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.roles.includes(role)}
                    onChange={() => handleRoleToggle(role)}
                  />
                  <span>{role}</span>
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : (editingPlayerId ? 'Cập nhật cầu thủ' : 'Lưu cầu thủ')}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Squad;
