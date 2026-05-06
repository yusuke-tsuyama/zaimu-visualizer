export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox='0 0 80 80' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <rect x='4' y='28' width='22' height='28' rx='4' fill='#1e3a5f' stroke='#2a6cb5' strokeWidth='1.2' />
      <rect x='4' y='28' width='22' height='7' rx='2' fill='#2a6cb5' />
      <line x1='8' y1='41' x2='22' y2='41' stroke='#4a7ab5' strokeWidth='0.8' />
      <line x1='8' y1='47' x2='22' y2='47' stroke='#4a7ab5' strokeWidth='0.8' />
      <line x1='8' y1='52' x2='19' y2='52' stroke='#4a7ab5' strokeWidth='0.8' />
      <rect x='29' y='18' width='22' height='28' rx='4' fill='#1e3a5f' stroke='#4a9fd4' strokeWidth='1.2' />
      <rect x='29' y='18' width='22' height='7' rx='2' fill='#4a9fd4' />
      <line x1='33' y1='31' x2='47' y2='31' stroke='#5aafdd' strokeWidth='0.8' />
      <line x1='33' y1='37' x2='47' y2='37' stroke='#5aafdd' strokeWidth='0.8' />
      <line x1='33' y1='42' x2='44' y2='42' stroke='#5aafdd' strokeWidth='0.8' />
      <rect x='54' y='28' width='22' height='28' rx='4' fill='#1e3a5f' stroke='#6abde0' strokeWidth='1.2' />
      <rect x='54' y='28' width='22' height='7' rx='2' fill='#6abde0' />
      <line x1='58' y1='41' x2='72' y2='41' stroke='#7acde8' strokeWidth='0.8' />
      <line x1='58' y1='47' x2='72' y2='47' stroke='#7acde8' strokeWidth='0.8' />
      <line x1='58' y1='52' x2='69' y2='52' stroke='#7acde8' strokeWidth='0.8' />
      <path d='M26 42 L29 42' stroke='#2a6cb5' strokeWidth='1.5' strokeDasharray='2 1' />
      <path d='M51 32 L54 38' stroke='#4a9fd4' strokeWidth='1.5' strokeDasharray='2 1' />
    </svg>
  )
}
