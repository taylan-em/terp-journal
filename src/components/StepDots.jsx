import { C } from '../constants/colors';
import Sound from '../lib/sound';

const StepDots = ({ current, total, onGo }) => (
  <div style={{ display:"flex", gap:6 }}>
    {Array.from({length:total},(_,i)=>(
      <button key={i} onClick={()=>{ Sound.play("tap"); onGo(i); }} style={{
        width:i===current?20:8, height:8, borderRadius:4, border:"none", cursor:"pointer",
        background:i<current?"#fbbf24":i===current?C.accent:C.faint, transition:"all 0.25s",
      }}/>
    ))}
  </div>
);

export default StepDots;
