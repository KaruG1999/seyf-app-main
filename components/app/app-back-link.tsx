import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export function AppBackLink({
  href,
  children = 'Regresar',
}: {
  href: string
  children?: string
}) {
  return (
    <Link
      href={href}
      className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
    >
      <ChevronLeft className="size-4 shrink-0" strokeWidth={2.25} />
      {children}
    </Link>
    
  )
}
