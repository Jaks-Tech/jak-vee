import { cookies } from "next/headers";
import { PageShell } from "@/components/page-shell";
import { db } from "@/lib/db";
import type { LiveCheckIn } from "./check-ins-feed";
import { CheckInsWorkspace } from "./check-ins-workspace";

type CheckIn = {
  id: string;
  checkin_type: string;
  title: string;
  body: string | null;
  mood: string | null;
  location_label: string | null;
  meet_time: Date | null;
  is_custom: boolean;
  author_name: string;
  created_at: Date;
};

async function getCheckIns() {
  const result = await db.query<CheckIn>(`
    select
      id,
      checkin_type,
      title,
      body,
      mood,
      location_label,
      meet_time,
      is_custom,
      author_name,
      created_at
    from public.daily_checkins
    order by created_at desc
    limit 50
  `);

  return result.rows;
}

function toLiveCheckIn(checkIn: CheckIn): LiveCheckIn {
  return {
    ...checkIn,
    created_at: checkIn.created_at.toISOString(),
    meet_time: checkIn.meet_time?.toISOString() ?? null,
  };
}

export default async function CheckInsPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ error?: string; saved?: string }>;
}>) {
  const cookieStore = await cookies();
  const currentPerson = cookieStore.get("jak_vee_person")?.value;
  const [params, checkIns] = await Promise.all([searchParams, getCheckIns()]);

  return (
    <PageShell>
      <section className="mx-auto w-full max-w-6xl px-5 pb-16 pt-8 sm:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold text-[#a1435e]">Daily check-ins</p>
          <h1 className="mt-2 text-4xl font-semibold text-[#2d1b22]">
            Stay close throughout the day.
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#765061]">
            Choose one check-in from the dropdown, write the update, and it will
            be saved into its own window below.
          </p>
          {params.saved ? (
            <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#8c4058]">
              Check-in saved.
            </p>
          ) : null}
          {params.error ? (
            <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#a1435e]">
              Please add a title and message before saving.
            </p>
          ) : null}
        </div>

        <CheckInsWorkspace
          initialCheckIns={checkIns.map(toLiveCheckIn)}
          currentPerson={currentPerson}
        />
      </section>
    </PageShell>
  );
}
