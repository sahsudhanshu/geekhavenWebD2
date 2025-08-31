import React from 'react';
import { seededChecksum } from '../utils/seed';

interface ChecksumBadgeProps {
  id: string | number;
  className?: string;
  prefix?: string;
}

export const ChecksumBadge: React.FC<ChecksumBadgeProps> = ({ id, className = '', prefix = 'ID' }) => {
  const display = seededChecksum(String(id));
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-mono font-medium tracking-wider badge-accent ${className}`.trim()}>
      <span>{prefix}</span>
      <span>{display}</span>
    </span>
  );
};

export default ChecksumBadge;
