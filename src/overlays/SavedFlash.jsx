import { C } from '../constants/colors';

const SavedFlash = () => (
  <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex", alignItems:"center", justifyContent:"center",
    background:"rgba(8,15,9,0.92)", backdropFilter:"blur(6px)" }}>
    <div style={{ textAlign:"center" }}>
      <div style={{ fontSize:64, marginBottom:16 }}>✅</div>
      <div style={{ fontSize:22, fontWeight:700, color:C.accent }}>Session saved!</div>
      <div style={{ fontSize:14, color:C.muted, marginTop:6 }}>+10 XP earned 🌿</div>
    </div>
  </div>
);

export default SavedFlash;
