import { cookies } from "next/headers";
import { Lightbulb } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { getLoveNotes } from "@/lib/notes";
import { NotesWorkspace } from "./notes-workspace";

const ideaCards = [
  "Things we need to buy",
  "Things we are praying for",
  "Date ideas",
  "Songs to listen to together",
  "Movies or videos to watch",
  "Food places to try",
  "Dreams for our future",
  "Apologies and honest talks",
];

export default async function NotesPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ error?: string; saved?: string }>;
}>) {
  const cookieStore = await cookies();
  const currentPerson = cookieStore.get("jak_vee_person")?.value;
  const [params, notes] = await Promise.all([searchParams, getLoveNotes()]);

  return (
    <PageShell>
      <section className="mx-auto w-full max-w-6xl px-5 pb-16 pt-8 sm:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold text-[#a1435e]">Our Board</p>
          <h1 className="mt-2 text-4xl font-semibold text-[#2d1b22]">
            To-dos, notes, affirmations, and plans.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#765061]">
            A shared place for the little things that keep the day connected.
          </p>
          {params.saved ? (
            <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#8c4058]">
              Entry saved.
            </p>
          ) : null}
          {params.error === "missing" ? (
            <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#a1435e]">
              Please add a type, title, and message before saving.
            </p>
          ) : null}
          {params.error === "save" ? (
            <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#a1435e]">
              Saving failed. Check the notes database table.
            </p>
          ) : null}
        </div>

        <NotesWorkspace notes={notes} currentPerson={currentPerson} />

        <section className="mt-6 rounded-3xl border border-[#FFD6E8] bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFD6E8] text-[#8c4058]">
              <Lightbulb size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#a1435e]">
                More ideas for this page
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-[#2d1b22]">
                Little lists worth keeping.
              </h2>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ideaCards.map((idea) => (
              <div
                key={idea}
                className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm font-semibold text-[#704153]"
              >
                {idea}
              </div>
            ))}
          </div>
        </section>
      </section>
    </PageShell>
  );
}
