import { SiteHeader } from "@/components/site-header";
import { cookies } from "next/headers";
import { getCoupleProfile } from "@/lib/profiles";
import { NotificationSound } from "@/components/notification-sound";

export async function PageShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const currentPerson = cookieStore.get("jak_vee_person")?.value;
  const currentProfile = await getCoupleProfile(currentPerson);

  return (
    <main className="min-h-screen overflow-hidden bg-[#FFF7FA] text-[#2d1b22]">
      <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_left,#FFD6E8_0,transparent_35%),radial-gradient(circle_at_top_right,#F8BBD0_0,transparent_24%)]" />
      <SiteHeader
        currentPerson={currentPerson}
        currentProfile={currentProfile}
      />
      <div className="relative z-10">{children}</div>
      <NotificationSound />
    </main>
  );
}
