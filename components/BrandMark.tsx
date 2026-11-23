import { useId } from 'react'

type BrandMarkProps = {
  size?: 'sm' | 'lg'
  className?: string
}

function maskIdFrom(prefix: string, raw: string) {
  return `${prefix}-${raw.replace(/:/g, '')}`
}

function ArchitecturalX({ maskId, framed = false }: { maskId: string; framed?: boolean }) {
  if (framed) {
    return (
      <g>
        <path d="M32 1.75 62.25 32 32 62.25 1.75 32Z" stroke="#C9B087" strokeWidth="0.6" fill="none" />
        <mask id={maskId} maskUnits="userSpaceOnUse">
          <rect width="64" height="64" fill="white" />
          <path d="M32 24.2 39.2 32 32 39.8 24.8 32Z" fill="black" />
        </mask>
        <g mask={`url(#${maskId})`} stroke="#C9B087" strokeLinecap="square">
          <path d="M18.5 12.5 47.5 51.5" strokeWidth="3.6" />
          <path d="M45.5 14.5 20.5 49.5" strokeWidth="0.9" />
        </g>
        <path d="M32 25 38.3 32 32 39 25.7 32Z" stroke="#C9B087" strokeWidth="0.7" fill="none" />
      </g>
    )
  }

  return (
    <g>
      <mask id={maskId} maskUnits="userSpaceOnUse">
        <rect width="46" height="54" fill="white" />
        <path d="M23 23.8 26.2 27 23 30.2 19.8 27Z" fill="black" />
      </mask>
      <g mask={`url(#${maskId})`} stroke="#C9B087" strokeLinecap="square">
        <path d="M4 3.5 42 50.5" strokeWidth="5.2" />
        <path d="M41 4.5 5 49.5" strokeWidth="3.6" />
      </g>
      <path d="M23 24.3 25.7 27 23 29.7 20.3 27Z" stroke="#C9B087" strokeWidth="0.65" fill="none" />
    </g>
  )
}

export function BrandMonogram({ className = '' }: { className?: string }) {
  const maskId = maskIdFrom('mono', useId())

  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className={className}>
      <ArchitecturalX maskId={maskId} framed />
    </svg>
  )
}

export default function BrandMark({ size = 'sm', className = '' }: BrandMarkProps) {
  const maskId = maskIdFrom('word', useId())
  const scale = size === 'lg' ? 'text-[34px] sm:text-[44px]' : 'text-[15px]'

  return (
    <span
      role="img"
      aria-label="InfluX"
      className={`inline-flex items-baseline whitespace-nowrap text-[#F2EFE9] ${scale} ${className}`}
    >
      <span
        className="font-editorial font-medium leading-[0.8]"
        style={{ letterSpacing: '0.16em' }}
      >
        INFLU
      </span>
      <svg
        viewBox="0 0 46 54"
        fill="none"
        aria-hidden="true"
        className="ml-[0.04em] h-[0.69em] w-auto shrink-0"
      >
        <ArchitecturalX maskId={maskId} />
      </svg>
    </span>
  )
}
