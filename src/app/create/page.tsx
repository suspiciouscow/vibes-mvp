import { serverSupabase } from "@/lib/supabase/server";
import CreateClient from "./ui";

export default async function CreatePage() {
  const supabase = await serverSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // server redirect
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Sign in required</h1>
        <a className="underline" href="/login">Go to login</a>
      </div>
    );
  }
  return <CreateClient />;
}
