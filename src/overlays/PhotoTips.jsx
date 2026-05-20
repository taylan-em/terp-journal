import Card from '../components/Card';
import { C } from '../constants/colors';

const PhotoTips = ({ onClose }) => (
  <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(8,15,9,0.97)", padding:24, overflowY:"auto" }}>
    <div style={{ maxWidth:440, margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
        <div style={{ fontSize:16, fontWeight:700, color:C.accent }}>📸 Bud Photo Tips</div>
        <button onClick={onClose} style={{ background:"transparent", border:"none", color:C.muted, fontSize:22, cursor:"pointer" }}>✕</button>
      </div>
      {[
        ["Natural light","Take near a window in daylight. Avoid flash — it kills trichome detail."],
        ["Macro mode","Use portrait or macro on your phone. Get 5–10cm away."],
        ["Dark background","Put the bud on black paper or a dark plate. Makes colours pop."],
        ["Multiple angles","Top-down = structure. Side-on = density. Close-up = trichomes."],
        ["Clean your lens","Wipe the lens before shooting. Pocket lint ruins macro shots."],
        ["Use a timer","Set a 2-second timer to avoid shake on close shots."],
      ].map(([t,d])=>(
        <Card key={t} style={{ marginBottom:10 }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.accent, marginBottom:4 }}>{t}</div>
          <div style={{ fontSize:12, color:C.muted, lineHeight:1.5 }}>{d}</div>
        </Card>
      ))}
    </div>
  </div>
);

export default PhotoTips;
