import { cookies } from "next/headers";
import { PageShell } from "@/components/page-shell";
import { getSharedLinks } from "@/lib/links";
import { LinksWorkspace } from "./links-workspace";

export default async function LinksPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ error?: string; saved?: string }>;
}>) {
  const cookieStore = await cookies();
  const currentPerson = cookieStore.get("jak_vee_person")?.value;
  const [params, links] = await Promise.all([searchParams, getSharedLinks()]);

  return (
    <PageShell>
      <section className="mx-auto w-full max-w-6xl px-5 pb-16 pt-8 sm:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold text-[#a1435e]">Shared library</p>
          <h1 className="mt-2 text-4xl font-semibold text-[#2d1b22]">
            Songs, movies, podcasts, links, and favorites.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#765061]">
            Keep anything you want each other to hear, watch, read, visit, or remember.
          </p>
             {params.error === "missing" ? (
            <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#a1435e]">
              Please add a title and type before saving.
            </p>
          ) : null}
          {params.error === "save" ? (
            <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#a1435e]">
              Saving failed. Check the shared links database table.
            </p>
          ) : null}
        </div>

        <LinksWorkspace links={links} currentPerson={currentPerson} />
      </section>
    </PageShell>
  );
}
