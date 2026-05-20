import { C } from '../constants/colors';

const Card = ({ children, style={}, onClick }) => (
  <div onClick={onClick} style={{
    background:C.card, border:`1px solid ${C.border}`,
    borderRadius:16, padding:16, ...style
  }}>
    {children}
  </div>
);

export default Card;
