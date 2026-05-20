import { C } from '../constants/colors';

export const Slider = ({ label, icon, value, onChange, min=1, max=10, step=1, color=C.accent }) => {
  const pct = ((value-min)/(max-min))*100;
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <span style={{ fontSize:13, color:C.muted }}><span>{icon}</span> {label}</span>
        <span style={{ fontSize:18, fontWeight:700, color }}>{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e=>onChange(+e.target.value)}
        className="styled-slider"
        style={{ "--pct":`${pct}%`, "--col":color, width:"100%", display:"block" }}/>
    </div>
  );
};

export const BidirSlider = ({ icon, label, value, onChange, color }) => (
  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
    <span style={{ fontSize:15, minWidth:20 }}>{icon}</span>
    <div style={{ flex:1 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ fontSize:12, color:C.muted }}>{label}</span>
        <span style={{ fontSize:12, fontWeight:700, color:value>0?color:value<0?"#f87171":C.faint }}>
          {value===0?"—":value>0?`+${value}`:value}
        </span>
      </div>
      <div style={{ position:"relative", height:6, background:C.faint, borderRadius:3 }}>
        <div style={{ position:"absolute", top:0, height:"100%", borderRadius:3,
          width:`${Math.abs(value)/5*50}%`,
          left:value>=0?"50%":`${50-Math.abs(value)/5*50}%`,
          background:value>=0?color:"#f87171" }}/>
        <div style={{ position:"absolute", left:"50%", top:-2, width:2, height:10, background:C.border }}/>
        <input type="range" min={-5} max={5} value={value} onChange={e=>onChange(+e.target.value)}
          style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0, cursor:"pointer", zIndex:10 }}/>
      </div>
    </div>
  </div>
);
