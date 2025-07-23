import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">Hedera-Verse</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/games"
              className="text-foreground/60 transition-colors hover:text-foreground/80"
            >
              Games
            </Link>
            <Link
              href="/events"
              className="text-foreground/60 transition-colors hover:text-foreground/80"
            >
              Events
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
