import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { NavbarLinks } from "@/components/NavbarLinks";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = data?.role === "admin";
  }

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-20">
      <NavbarLinks
        isAdmin={isAdmin}
        isLoggedIn={!!user}
        signOutAction={signOut}
      />
    </header>
  );
}
