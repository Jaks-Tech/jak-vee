import { cookies } from "next/headers";
import { PageShell } from "@/components/page-shell";
import { getStoryChapters } from "@/lib/story";
import { StoryWorkspace } from "./story-workspace";

export default async function StoryPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ error?: string; saved?: string }>;
}>) {
  const cookieStore = await cookies();
  const currentPerson = cookieStore.get("jak_vee_person")?.value;
  const [params, chapters] = await Promise.all([
    searchParams,
    getStoryChapters(),
  ]);

  return (
    <PageShell>
      <section className="mx-auto w-full max-w-5xl px-5 pb-16 pt-8 sm:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold text-[#a1435e]">Our story</p>
          <h1 className="mt-2 text-4xl font-semibold text-[#2d1b22]">
            A growing timeline of your relationship.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#765061]">
            Preserve the beginning, milestones, hard days, dreams, promises, and
            little chapters that make this story yours.
          </p>
          {params.saved ? (
            <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#8c4058]">
              Chapter saved.
            </p>
          ) : null}
          {params.error === "missing" ? (
            <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#a1435e]">
              Please add a title and chapter type before saving.
            </p>
          ) : null}
          {params.error === "save" ? (
            <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#a1435e]">
              Saving failed. Check the story database table.
            </p>
          ) : null}
        </div>

        <StoryWorkspace chapters={chapters} currentPerson={currentPerson} />
      </section>
    </PageShell>
  );
}
