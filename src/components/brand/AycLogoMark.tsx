import logoMark from '@/assets/brand/ayc-logo-mark-f.png'
import './AycLogoMark.css'

export type AycLogoMarkSize = 'nav' | 'sm' | 'md' | 'lg'

const PX: Record<AycLogoMarkSize, number> = {
  nav: 40,
  sm: 48,
  md: 72,
  lg: 112,
}

type Props = {
  size?: AycLogoMarkSize
  className?: string
  /** Decorative marks should pass empty alt when adjacent text names the brand. */
  alt?: string
  decorative?: boolean
}

export function AycLogoMark({
  size = 'nav',
  className = '',
  alt = 'Arkansas Youth Coalition',
  decorative = false,
}: Props) {
  const px = PX[size]
  return (
    <img
      src={logoMark}
      alt={decorative ? '' : alt}
      width={px}
      height={px}
      className={['ayc-logo-mark', `ayc-logo-mark--${size}`, className].filter(Boolean).join(' ')}
      decoding="async"
      draggable={false}
    />
  )
}
