"use client";

interface StatCardWideProps {
  icon: "distance";
  value: string;
  label: string;
}

export default function StatCardWide({ icon, value, label }: StatCardWideProps) {
  const getIcon = () => {
    switch (icon) {
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
        padding: '16px 20px',
        marginTop: '20px'
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        {getIcon()}
        <span className="text-[11px] font-medium uppercase tracking-[0.5px] text-white/40">
          {label}
        </span>
      </div>
      <div className="text-[17px] font-medium tracking-[-0.5px] text-white" suppressHydrationWarning>
        {value}
      </div>
    </div>
  );
}
