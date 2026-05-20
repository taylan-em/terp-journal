import { useEffect } from 'react';
import { C } from '../constants/colors';
import Sound from '../lib/sound';

const MilestoneToast = ({ milestone, onClose }) => {
  useEffect(() => {
    Sound.play("milestone");
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{ position:"fixed", top:80, left:"50%", transform:"translateX(-50%)", zIndex:300,
      background:`linear-gradient(135deg,${C.card},#0d2a10)`, border:`1px solid ${C.accent}66`,
      borderRadius:16, padding:"14px 20px", boxShadow:`0 8px 32px ${C.accent}33`,
      display:"flex", alignItems:"center", gap:12, minWidth:280, maxWidth:400,
      animation:"slideDown 0.3s ease" }}>
      <div style={{ fontSize:32 }}>{milestone.icon}</div>
      <div>
        <div style={{ fontSize:13, fontWeight:700, color:C.accent }}>Achievement Unlocked!</div>
        <div style={{ fontSize:14, fontWeight:600, color:C.text }}>{milestone.title}</div>
        <div style={{ fontSize:11, color:C.muted }}>{milestone.desc}</div>
      </div>
      <button onClick={onClose} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:18, marginLeft:"auto" }}>✕</button>
    </div>
  );
};

export default MilestoneToast;
