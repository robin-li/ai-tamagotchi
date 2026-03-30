interface StatBarProps {
  icon: string;
  label: string;
  value: number;
  warningThreshold?: number;
}

export default function StatBar({ icon, label, value, warningThreshold }: StatBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const isWarning = warningThreshold !== undefined && clamped < warningThreshold;

  const barColor = isWarning
    ? 'bg-red-500'
    : clamped >= 70
      ? 'bg-green-500'
      : clamped >= 40
        ? 'bg-yellow-500'
        : 'bg-orange';

  return (
    <div className="border-2 border-brown bg-cream-dark p-3">
      <div className="mb-1 flex items-center justify-between font-pixel text-[10px]">
        <span>
          {icon} {label}
        </span>
        <span className={isWarning ? 'text-red-500' : ''}>{clamped}</span>
      </div>
      <div className="h-4 w-full border-2 border-brown bg-cream">
        <div
          className={`h-full transition-all duration-300 ${barColor}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
