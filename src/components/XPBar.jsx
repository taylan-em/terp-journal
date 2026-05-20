import { C } from '../constants/colors';
import { getRank, getNextRank, getRankProgress } from '../lib/utils';

const XPBar = ({ xp }) => {
  const rank = getRank(xp);
  const next = getNextRank(xp);
  const pct = getRankProgress(xp, next);
  return (
    <div style={{ marginBottom:4 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ fontSize:11, color:rank.color, fontWeight:600 }}>{rank.icon} {rank.title}</span>
        <span style={{ fontSize:11, color:C.muted }}>{xp} XP{next?` · ${(next.min*10) - xp} to ${next.title}`:""}</span>
      </div>
      <div style={{ height:5, background:C.faint, borderRadius:3, overflow:"hidden" }}>
        <div style={{ height:"100%", borderRadius:3, background:`linear-gradient(90deg,${rank.color}88,${rank.color})`, width:`${pct}%`, transition:"width 0.5s" }}/>
      </div>
    </div>
  );
};

export default XPBar;
