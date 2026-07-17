import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from './common/Modal';
import styles from './ConfirmMatchModal.module.css';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { Match, Player } from '../hooks/useAppData';

interface ConfirmMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match | null;
  players: Player[];
  onSuccess: () => void;
}

export const ConfirmMatchModal = ({ isOpen, onClose, match, players, onSuccess }: ConfirmMatchModalProps) => {
  const [ourScore, setOurScore] = useState('');
  const [oppScore, setOppScore] = useState('');
  const [scorers, setScorers] = useState<{ playerId: string; goals: number }[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!match) return null;

  const handleAddScorer = () => {
    if (players.length > 0) {
      setScorers([...scorers, { playerId: players[0].id, goals: 1 }]);
    }
  };

  const handleRemoveScorer = (index: number) => {
    setScorers(scorers.filter((_, i) => i !== index));
  };

  const handleScorerChange = (index: number, field: 'playerId' | 'goals', value: string | number) => {
    const newScorers = [...scorers];
    newScorers[index] = { ...newScorers[index], [field]: value };
    setScorers(newScorers);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      // Giới hạn < 20MB
      const validFiles = files.filter(f => f.size < 20 * 1024 * 1024);
      if (validFiles.length < files.length) {
        toast.warning('Vui lòng chọn video có dung lượng dưới 20MB. Các file lớn hơn đã bị loại bỏ.');
      }
      setVideoFiles(validFiles);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ourScore || !oppScore) return;
    
    setIsSubmitting(true);
    try {
      // 1. Upload Videos
      const highlight_urls: string[] = [];
      for (const file of videoFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${match.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('highlights')
          .upload(filePath, file);
          
        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error('Lỗi upload video: ' + uploadError.message);
          continue; // Skip if failed, but continue others
        }
        
        const { data } = supabase.storage.from('highlights').getPublicUrl(filePath);
        if (data?.publicUrl) highlight_urls.push(data.publicUrl);
      }

      // 2. Update Match Status
      const { error: matchError } = await supabase
        .from('matches')
        .update({
          our_score: parseInt(ourScore),
          opponent_score: parseInt(oppScore),
          status: 'Đã kết thúc',
          highlight_urls: highlight_urls.length > 0 ? highlight_urls : null
        })
        .eq('id', match.id);

      if (matchError) throw matchError;

      // 3. Insert Goals & Update Player Stats
      for (const scorer of scorers) {
        const goalsToInsert = [];
        for (let i = 0; i < scorer.goals; i++) {
          goalsToInsert.push({
            match_id: match.id,
            player_id: scorer.playerId,
            minute: 0 // Random/0 minute as requested
          });
        }
        
        if (goalsToInsert.length > 0) {
          const { error: goalsError } = await supabase.from('match_goals').insert(goalsToInsert);
          if (goalsError) console.error('Error inserting goals:', goalsError);

          // Lấy total_goals hiện tại
          const p = players.find(p => p.id === scorer.playerId);
          if (p) {
            await supabase
              .from('players')
              .update({ total_goals: (p.total_goals || 0) + scorer.goals })
              .eq('id', p.id);
          }
        }
      }

      // 4. Generate Zalo Summary
      const matchDateObj = new Date(match.match_date);
      const time = matchDateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const dateStr = matchDateObj.toLocaleDateString('vi-VN');
      
      let scorerText = '';
      if (scorers.length > 0) {
        scorerText = '\n🔥 Ghi bàn (FC Daddy):\n';
        scorers.forEach(s => {
          const p = players.find(p => p.id === s.playerId);
          if (p) {
            scorerText += `- ${p.full_name} (${s.goals} bàn)\n`;
          }
        });
      }

      const summary = `⚽ KẾT QUẢ TRẬN ĐẤU ⚽\n🏆 FC Daddy ${ourScore} - ${oppScore} ${match.opponent}\n📅 Thời gian: ${time} (${dateStr})\n🏟 Sân bóng: ${match.stadium}${scorerText}`;
      
      try {
        await navigator.clipboard.writeText(summary);
      } catch (err) {
        console.error("Failed to copy clipboard", err);
      }
      
      setIsSuccess(true);
    } catch (err: any) {
      toast.error('Đã có lỗi xảy ra: ' + err.message);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={() => {
        setIsSuccess(false);
        onSuccess();
      }}>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Xác nhận thành công!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Kết quả trận đấu đã được lưu và copy vào khay nhớ tạm.
          </p>
          <button 
            onClick={() => window.open('https://zalo.me', '_blank')}
            style={{ 
              width: '100%', padding: '14px', backgroundColor: '#0068FF', color: 'white', 
              border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer',
              marginBottom: '12px'
            }}
          >
            Mở Zalo để dán vào nhóm
          </button>
          <button 
            onClick={() => {
              setIsSuccess(false);
              onSuccess();
            }}
            style={{ 
              width: '100%', padding: '14px', backgroundColor: 'transparent', color: 'var(--text-secondary)', 
              border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer'
            }}
          >
            Đóng
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Xác nhận kết quả</h2>
      <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>
        Trận: FC Daddy vs {match.opponent}
      </p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Tỉ số</label>
          <div className={styles.scoreInputs}>
            <input 
              type="number" 
              placeholder="FC Daddy" 
              value={ourScore}
              onChange={e => setOurScore(e.target.value)}
              required
              min="0"
            />
            <span className={styles.scoreDivider}>-</span>
            <input 
              type="number" 
              placeholder={match.opponent} 
              value={oppScore}
              onChange={e => setOppScore(e.target.value)}
              required
              min="0"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Cầu thủ ghi bàn</label>
          {scorers.map((scorer, idx) => (
            <div key={idx} className={styles.scorerRow}>
              <select 
                value={scorer.playerId} 
                onChange={(e) => handleScorerChange(idx, 'playerId', e.target.value)}
              >
                {players.map(p => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
                ))}
              </select>
              <div className={styles.goalInputWrapper}>
                <input 
                  type="number" 
                  min="1" 
                  value={scorer.goals}
                  onChange={(e) => handleScorerChange(idx, 'goals', parseInt(e.target.value))}
                />
                <span className={styles.goalLabel}>Bàn</span>
              </div>
              <button type="button" onClick={() => handleRemoveScorer(idx)} className={styles.removeButton}>
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          <button type="button" onClick={handleAddScorer} className={styles.addScorerButton}>
            <Plus size={16} /> Thêm cầu thủ
          </button>
        </div>

        <div className={styles.formGroup}>
          <label>Video Highlight (Tùy chọn, &lt; 20MB)</label>
          <input 
            type="file" 
            accept="video/*" 
            multiple 
            onChange={handleFileChange}
          />
        </div>

        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? 'Đang xử lý...' : 'Xác nhận hoàn thành'}
        </button>
      </form>
    </Modal>
  );
};
