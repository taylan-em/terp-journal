import { useEffect } from 'react';
import { C } from '../constants/colors';
import Sound from '../lib/sound';

const LevelUpOverlay = ({ rank, onClose }) => {
  useEffect(() => {
    Sound.play("levelup");
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{ position:"fixed", inset:0, zIndex:250, background:"rgba(8,15,9,0.92)", display:"flex", alignItems:"center", justifyContent:"center",
      animation:"fadeIn 0.3s ease" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:72, marginBottom:8, animation:"bounce 0.5s ease" }}>{rank.icon}</div>
        <div style={{ fontSize:14, color:C.muted, letterSpacing:"0.2em", marginBottom:8 }}>RANK UP</div>
        <div style={{ fontSize:28, fontWeight:800, color:rank.color, marginBottom:8 }}>{rank.title}</div>
        <div style={{ fontSize:14, color:C.muted }}>Keep logging to advance</div>
        <button onClick={onClose} style={{ marginTop:20, padding:"10px 28px", borderRadius:20, border:"none",
          background:rank.color, color:"#080502", fontWeight:700, cursor:"pointer", fontSize:14 }}>
          Let's go →
        </button>
      </div>
    </div>
  );
};

export default LevelUpOverlay;
