const LogoMark = ({ size=32 }) => {
  const s = size / 100;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ flexShrink:0, display:"block" }}>
      <defs>
        <linearGradient id="lmtbl" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#fff7ed"/>
          <stop offset="35%" stopColor="#fed7aa"/>
          <stop offset="100%" stopColor="#ea580c"/>
        </linearGradient>
        <linearGradient id="lmlf" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c2410c"/>
          <stop offset="100%" stopColor="#7c2d12"/>
        </linearGradient>
        <linearGradient id="lmrf" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fb923c"/>
          <stop offset="100%" stopColor="#9a3412"/>
        </linearGradient>
        <linearGradient id="lmll" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c2d12"/>
          <stop offset="100%" stopColor="#3d1407"/>
        </linearGradient>
        <linearGradient id="lmlr" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#9a3412"/>
          <stop offset="100%" stopColor="#3d1407"/>
        </linearGradient>
        <linearGradient id="lmiris" x1="30%" y1="20%" x2="70%" y2="80%">
          <stop offset="0%" stopColor="#fed7aa"/>
          <stop offset="50%" stopColor="#f97316"/>
          <stop offset="100%" stopColor="#7c2d12"/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="20" fill="#0c0905"/>
      {/* pavilion */}
      <polygon points="50,88 21,55 37,50" fill="url(#lmll)" stroke="#431407" strokeWidth="0.8" strokeLinejoin="round"/>
      <polygon points="50,88 79,55 63,50" fill="url(#lmlr)" stroke="#561e0a" strokeWidth="0.8" strokeLinejoin="round"/>
      <polygon points="37,50 50,88 63,50 50,53" fill="#6b2210" stroke="#7c2d12" strokeWidth="0.6" strokeLinejoin="round"/>
      {/* crown */}
      <polygon points="50,12 21,55 37,50 50,39" fill="url(#lmlf)" stroke="#ea580c" strokeWidth="0.8" strokeLinejoin="round"/>
      <polygon points="50,12 79,55 63,50 50,39" fill="url(#lmrf)" stroke="#fb923c" strokeWidth="1" strokeLinejoin="round"/>
      <polygon points="50,12 21,55 29,40" fill="#9a3412" stroke="#c2410c" strokeWidth="0.6" strokeLinejoin="round"/>
      <polygon points="50,12 79,55 71,40" fill="#7c2d12" stroke="#ea580c" strokeWidth="0.6" strokeLinejoin="round"/>
      {/* table */}
      <polygon points="29,40 50,12 71,40 63,50 50,39 37,50" fill="url(#lmtbl)" stroke="#fed7aa" strokeWidth="1.2" strokeLinejoin="round"/>
      <line x1="29" y1="40" x2="50" y2="12" stroke="#fff7ed" strokeWidth="0.8" opacity="0.3"/>
      <line x1="50" y1="12" x2="79" y2="55" stroke="#fed7aa" strokeWidth="0.8" opacity="0.3"/>
      {/* eye */}
      <path d="M50,38 C40,38 30,44 24,50 C30,56 40,62 50,62 C60,62 70,56 76,50 C70,44 60,38 50,38 Z" fill="#1c0e04" stroke="#f97316" strokeWidth="1"/>
      <circle cx="50" cy="50" r="9" fill="url(#lmiris)"/>
      <circle cx="50" cy="50" r="5" fill="#0a0602"/>
      <ellipse cx="50" cy="50" rx="2" ry="5" fill="#060402"/>
      <circle cx="47" cy="47" r="2" fill="#ffffff" opacity="0.6"/>
      {/* eyelid lines */}
      <path d="M24,48 C35,39 43,37 50,37 C57,37 65,39 76,48" fill="none" stroke="#f97316" strokeWidth="0.8" opacity="0.55"/>
      <path d="M25,52 C36,60 43,62 50,62 C57,62 64,60 75,52" fill="none" stroke="#ea580c" strokeWidth="0.7" opacity="0.4"/>
      {/* lashes */}
      <line x1="26" y1="46" x2="23" y2="41" stroke="#f97316" strokeWidth="0.8" opacity="0.6"/>
      <line x1="35" y1="40" x2="33" y2="35" stroke="#f97316" strokeWidth="0.8" opacity="0.6"/>
      <line x1="50" y1="37" x2="50" y2="32" stroke="#f97316" strokeWidth="0.9" opacity="0.7"/>
      <line x1="65" y1="40" x2="67" y2="35" stroke="#f97316" strokeWidth="0.8" opacity="0.6"/>
      <line x1="74" y1="46" x2="77" y2="41" stroke="#f97316" strokeWidth="0.8" opacity="0.6"/>
      {/* culet */}
      <circle cx="50" cy="88" r="2.5" fill="#fbbf24"/>
    </svg>
  );
};

export default LogoMark;
