export type TransactionStatus = 'success' | 'pending' | 'processing' | 'failed';

export interface AuditStep {
  step: number;
  title: string;
  subtitle: string;
  time?: string;
  status: 'completed' | 'active' | 'waiting';
  completed?: boolean;
  icon: string;
}

export interface QrisData {
  merchantName: string;
  nmid: string;
  expiredAt: string; // e.g., '15:17:40 WIB'
  remainingSeconds: number;
  qrPayload: string;
  uniqueCode: number;
}

export interface TransactionRecord {
  id: string;
  status: TransactionStatus;
  statusLabel: string;
  badgeBg: string;
  badgeColor: string;
  accentBg: string;
  createdAt: string;
  clearedAt: string;
  durationText?: string;
  stepActive: number;
  stepProgressText: string;
  steps: AuditStep[];
  
  // Specific to Success state
  tokenLabel?: string;
  tokenCode?: string;
  tokenSub?: string;
  hasCopyToken?: boolean;
  
  // Specific to Pending QRIS state
  qrisData?: QrisData;

  // Specific to Processing state
  processingMessage?: string;

  // Order Details
  category: string;
  categoryCode: string;
  product: string;
  custId: string;
  custName: string;
  tarif: string;
  refCode: string;
  priceBase: number;
  adminFee: number;
  discount: number;
  total: number;
  method: string;
  reconcileId: string;
  billerName: string;
  hashToken?: string;
  serverIp?: string;
}

export function formatRupiah(amount: number): string {
  return 'Rp' + amount.toLocaleString('id-ID');
}
