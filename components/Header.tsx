"use client";

interface HeaderProps {
  location: string;
}

export default function Header({ location }: HeaderProps) {
  return (
    <header className="w-full max-w-[430px] px-6 pb-8 text-center" style={{ marginBottom: '40px' }}>
      <div className="text-[13px] font-medium uppercase tracking-[1.5px] text-[rgba(255,255,255,0.5)] mb-4" suppressHydrationWarning>
        {location}
      </div>
    </header>
  );
}
