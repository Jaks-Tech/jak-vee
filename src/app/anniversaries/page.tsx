import { cookies } from "next/headers";
import { PageShell } from "@/components/page-shell";
import { getAnniversaryReminders } from "@/lib/anniversaries";
import { AnniversaryWorkspace } from "./anniversary-workspace";

export default async function AnniversariesPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ error?: string; saved?: string }>;
}>) {
  const cookieStore = await cookies();
  const currentPerson = cookieStore.get("jak_vee_person")?.value;
  const [params, events] = await Promise.all([
    searchParams,
    getAnniversaryReminders(),
  ]);

  return (
    <PageShell>
      <section className="mx-auto w-full max-w-6xl px-5 pb-16 pt-8 sm:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold text-[#a1435e]">Reminders</p>
          <h1 className="mt-2 text-4xl font-semibold text-[#2d1b22]">
            Anniversaries, trips, dates, and special days.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#765061]">
            Set up events, keep a countdown, and prepare email reminders for the
            days that matter to both of you.
          </p>
          {params.saved ? (
            <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#8c4058]">
              Reminder saved.
            </p>
          ) : null}
          {params.error === "missing" ? (
            <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#a1435e]">
              Please add a title, type, date, and repeat rule before saving.
            </p>
          ) : null}
          {params.error === "email" ? (
            <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#a1435e]">
              Add at least one email address when email reminders are enabled.
            </p>
          ) : null}
          {params.error === "save" ? (
            <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#a1435e]">
              Saving failed. Check the reminders database table.
            </p>
          ) : null}
        </div>

        <AnniversaryWorkspace events={events} currentPerson={currentPerson} />
      </section>
    </PageShell>
  );
}
