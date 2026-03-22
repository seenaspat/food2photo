import CookieBanner from "@/components/cookie-banner";
import SiteFooter from "@/components/site-footer";
import SiteNavbar from "@/components/site-navbar";
import { createClient } from "@/lib/supabase/server";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const initialIsAuthed = Boolean(data.user?.id);

  return (
    <>
      <SiteNavbar initialIsAuthed={initialIsAuthed} />
      {children}
      <SiteFooter />
      <CookieBanner />
    </>
  );
}
