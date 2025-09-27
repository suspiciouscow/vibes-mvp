export const metadata = { title: "Vibes MVP" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-black text-white">
        <header className="sticky top-0 z-10 border-b border-white/10 bg-black/60 backdrop-blur">
          <nav className="mx-auto flex max-w-3xl items-center gap-4 p-3">
            <a href="/" className="font-semibold">Vibes</a>
            <a href="/create" className="ml-auto rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/5">
              Create
            </a>
          </nav>
        </header>
        <main className="mx-auto max-w-3xl p-4">{children}</main>
      </body>
    </html>
  );
}