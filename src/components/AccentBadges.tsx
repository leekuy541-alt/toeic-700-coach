interface Props {
  accents: string[];
  show: boolean;
}

export default function AccentBadges({ accents, show }: Props) {
  if (!show || accents.length === 0) return null;
  return (
    <div className="accent-row" aria-label="사용된 억양">
      {accents.map((a) => (
        <span key={a} className={`accent-badge accent-${a}`}>
          {a}
        </span>
      ))}
    </div>
  );
}
