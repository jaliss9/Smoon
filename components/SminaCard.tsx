"use client";

import { useEffect, useState } from "react";
import SminaBar from "./SminaBar";

interface SminaCardProps {
  value: number;
}

export default function SminaCard({ value }: SminaCardProps) {
  // Protection contre les valeurs invalides
  const safeValue = typeof value === 'number' && !isNaN(value) ? Math.min(100, Math.max(0, value)) : 0;
  
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
      <div className="flex items-center gap-2" style={{ marginBottom: '8px' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(200,180,255,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <span className="text-[11px] font-medium uppercase tracking-[0.5px] text-white/40">
          SMINA RADIANCE
        </span>
      </div>
      <SminaBar value={safeValue} />
    </div>
  );
}
