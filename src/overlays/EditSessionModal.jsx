import Card from '../components/Card';
import { Slider } from '../components/Slider';
import { C } from '../constants/colors';
import { EFFECTS } from '../constants/enums';

const EditSessionModal = ({ editingSession, setEditingSession, onSave, onClose, allStrains }) => {
  if (!editingSession) return null;
  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(8,15,9,0.95)", overflowY:"auto", padding:20 }}>
      <div style={{ maxWidth:480, margin:"0 auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
          <div style={{ fontSize:16, fontWeight:700, color:C.accent }}>Edit Session</div>
          <button onClick={onClose} style={{ background:"transparent", border:"none", color:C.muted, fontSize:22, cursor:"pointer" }}>✕</button>
        </div>
        <Card style={{ marginBottom:12 }}>
          <div style={{ fontSize:11, color:C.muted, marginBottom:8 }}>STRAIN</div>
          <select value={editingSession.strain} onChange={e=>setEditingSession(s=>({...s,strain:e.target.value}))}
            style={{ width:"100%", padding:"10px", background:"#140800", border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:13 }}>
            {allStrains.map(s=><option key={s.name} value={s.name}>{s.name}</option>)}
          </select>
        </Card>
        <Card style={{ marginBottom:12 }}>
          <Slider label="Overall Rating" icon="⭐" value={editingSession.ratings?.overall||7}
            onChange={v=>setEditingSession(s=>({...s,ratings:{...s.ratings,overall:v}}))} color="#f59e0b"/>
        </Card>
        <Card style={{ marginBottom:12 }}>
          <div style={{ fontSize:11, color:C.muted, marginBottom:8 }}>EFFECTS</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {EFFECTS.map(e=>(
              <button key={e} onClick={()=>setEditingSession(s=>({...s,effects:s.effects?.includes(e)?s.effects.filter(x=>x!==e):[...(s.effects||[]),e]}))}
                style={{ padding:"6px 12px", borderRadius:20, fontSize:12, cursor:"pointer",
                  border:`1.5px solid ${editingSession.effects?.includes(e)?C.accent:C.border}`,
                  background:editingSession.effects?.includes(e)?C.accentDim:C.card,
                  color:editingSession.effects?.includes(e)?C.accent:C.muted }}>
                {e}
              </button>
            ))}
          </div>
        </Card>
        <Card style={{ marginBottom:12 }}>
          <div style={{ fontSize:11, color:C.muted, marginBottom:8 }}>NOTES</div>
          <textarea value={editingSession.notes||""} onChange={e=>setEditingSession(s=>({...s,notes:e.target.value}))}
            rows={3} style={{ width:"100%", padding:"10px", background:"#140800", border:`1px solid ${C.border}`,
              borderRadius:8, color:C.text, fontSize:13, resize:"none", boxSizing:"border-box" }}/>
        </Card>
        <button onClick={()=>onSave(editingSession)} style={{ width:"100%", padding:"14px", borderRadius:12, border:"none", cursor:"pointer",
          background:`linear-gradient(135deg,#c2410c,${C.accent})`, color:"#080502", fontSize:14, fontWeight:700 }}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default EditSessionModal;
