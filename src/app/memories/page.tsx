import { cookies } from "next/headers";
import { PageShell } from "@/components/page-shell";
import { getMemories } from "@/lib/memories";
import { MemoriesWorkspace } from "./memories-workspace";

export default async function MemoriesPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ error?: string; saved?: string }>;
}>) {
  const cookieStore = await cookies();
  const currentPerson = cookieStore.get("jak_vee_person")?.value;
  const [params, memories] = await Promise.all([searchParams, getMemories()]);

  return (
    <PageShell>
      <section className="mx-auto w-full max-w-6xl px-5 pb-16 pt-8 sm:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold text-[#a1435e]">Memories</p>
          <h1 className="mt-2 text-4xl font-semibold text-[#2d1b22]">
            Photos, videos, and moments.
          </h1>

          {params.saved ? (
            <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#8c4058]">
              Memory saved.
            </p>
          ) : null}
          {params.error === "missing" ? (
            <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#a1435e]">
              Please add a title before saving.
            </p>
          ) : null}
          {params.error === "upload" ? (
            <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#a1435e]">
              Upload failed. Check the Supabase service role key and storage bucket.
            </p>
          ) : null}
        </div>

        <MemoriesWorkspace
          initialMemories={memories}
          currentPerson={currentPerson}
        />
      </section>
    </PageShell>
  );
}
