import { ShieldCheck, Users, AlertCircle } from 'lucide-react';
import type { VerificationStatus } from '@/types';

interface Props {
  status: VerificationStatus;
  size?: 'sm' | 'md';
}

export default function VerificationBadge({ status, size = 'sm' }: Props) {
  const config = {
    'venue-confirmed': {
      icon: ShieldCheck,
      label: 'Venue Confirmed',
      className: 'badge-confirmed',
    },
    'community-reported': {
      icon: Users,
      label: 'Community Reported',
      className: 'badge-community',
    },
    unverified: {
      icon: AlertCircle,
      label: 'Unverified',
      className: 'badge-unverified',
    },
    verified: {
      icon: ShieldCheck,
      label: 'Verified',
      className: 'badge-confirmed',
    },
  };

  const { icon: Icon, label, className } = config[status] || config.unverified;

  return (
    <span className={`badge ${className} ${size === 'sm' ? 'text-[11px]' : 'text-xs'}`}>
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {label}
    </span>
  );
}
