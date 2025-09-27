import Link from "next/link";
import { serverSupabase } from "@/lib/supabase/server";

async function AuthButtons() {
  const supabase = await serverSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <Link href="/login" className="rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/5">Sign in</Link>;
  }

  async function signOut() {
    "use server";
    const supabase = await serverSupabase();
    await supabase.auth.signOut();
  }

  return (
    <form action={signOut}>
      <button className="rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/5">
        Sign out
      </button>
    </form>
  );
}

export const metadata = { title: "Vibes MVP" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script defer src="https://cdn.jsdelivr.net/npm/@mux/mux-player"></script>
      </head>
      <body className="min-h-dvh bg-black text-white">
        <header className="sticky top-0 z-10 border-b border-white/10 bg-black/60 backdrop-blur">
          <nav className="mx-auto flex max-w-3xl items-center gap-4 p-3">
            <Link href="/" className="font-semibold">Vibes</Link>
            <Link href="/create" className="rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/5">Create</Link>
            <div className="ml-auto"><AuthButtons /></div>
          </nav>
        </header>
        <main className="mx-auto max-w-3xl p-4">{children}</main>
      </body>
    </html>
  );
}