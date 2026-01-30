"use client";

interface StatCardProps {
  icon: "rise" | "set" | "fullmoon" | "duration" | "distance";
  value: string;
  label: string;
}

export default function StatCard({ icon, value, label }: StatCardProps) {
  const getIcon = () => {
    const iconStyle = "w-5 h-5 stroke-white/50 stroke-[1.5px]";
    switch (icon) {
      case "rise":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        );
      case "set":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        );
      case "fullmoon":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
          </svg>
        );
      case "duration":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        );
      case "distance":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        );
    }
  };

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '16px',
        padding: '16px'
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        {getIcon()}
        <span className="text-[11px] font-medium uppercase tracking-[0.5px] text-white/40">
          {label}
        </span>
      </div>
      <div 
        className="text-[20px] font-medium tracking-[-0.5px] text-white" 
        style={label === "PLEINE LUNE" ? { textAlign: 'center' } : {}}
        suppressHydrationWarning
      >
        {value}
      </div>
    </div>
  );
}
