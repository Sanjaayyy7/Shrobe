import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  size?: "small" | "medium" | "large"
  variant?: "default" | "white"
  href?: string
}

export default function Logo({ size = "medium", variant = "default", href = "/" }: LogoProps) {
  const sizes = {
    small: { width: 100, height: 40 },
    medium: { width: 140, height: 56 },
    large: { width: 180, height: 72 },
  }

  const { width, height } = sizes[size]

  const logoContent = (
    <div className="flex items-center">
      <Image
        src="/images/shrobe-logo.png"
        alt="Shrobe Logo"
        width={width}
        height={height}
        className="object-contain"
        priority
      />
      <span className="sr-only">Shrobe</span>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {logoContent}
      </Link>
    )
  }

  return logoContent
}
