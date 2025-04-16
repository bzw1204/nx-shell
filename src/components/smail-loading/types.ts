import type { SmileSpinStatus } from 'smail-loading'

export const StatusColorMap = {
  loading: 'var(--n-text-color)',
  success: '#36ad6a',
  error: '#d03050'
}
export interface StatusColor {
  success?: string
  error?: string
  normal?: string
}
export interface SmileSpinProps {
  size?: number
  loading?: boolean
  status?: SmileSpinStatus
  color?: string
  statusColor?: StatusColor
}
