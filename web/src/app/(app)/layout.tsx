import { signOut } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { Logo, Icon } from "@/components/ui";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
          <Logo />
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-muted sm:inline">{user?.email}</span>
            <form action={signOut}>
              <button className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-sm font-medium text-muted transition hover:bg-canvas hover:text-ink">
                <Icon name="logout" className="h-4 w-4" />
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8">
        {children}
      </main>
    </div>
  );
}
