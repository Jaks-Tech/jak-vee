import Link from "next/link";
import { cookies } from "next/headers";
import { Lock, Unlock } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { getPrivateMemories } from "@/lib/memories";
import { hasPrivateMemoriesAccess } from "@/lib/private-memories";
import { MemoriesWorkspace } from "../memories-workspace";
import { lockPrivateMemories, unlockPrivateMemories } from "./actions";

export default async function PrivateMemoriesPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ error?: string; saved?: string }>;
}>) {
  const [params, isUnlocked, cookieStore] = await Promise.all([
    searchParams,
    hasPrivateMemoriesAccess(),
    cookies(),
  ]);
  const currentPerson = cookieStore.get("jak_vee_person")?.value;
  const memories = isUnlocked ? await getPrivateMemories() : [];

  return (
    <PageShell>
      <section className="mx-auto w-full max-w-6xl px-5 pb-16 pt-8 sm:px-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#a1435e]">
              <Lock size={15} />
              Private memories
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-[#2d1b22]">
              Our private folder.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#765061]">
              A quieter place for photos and videos that should stay behind one
              more shared password.
            </p>

            {params.saved ? (
              <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#8c4058]">
                Private memory saved.
              </p>
            ) : null}
            {params.error === "missing" ? (
              <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#a1435e]">
                Please add a title before saving.
              </p>
            ) : null}
            {params.error === "upload" ? (
              <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#a1435e]">
                Upload failed. Please try again.
              </p>
            ) : null}
          </div>

          <Link
            href="/memories"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#8c4058] ring-1 ring-[#FFD6E8]"
          >
            Back to memories
          </Link>
        </div>

        {!isUnlocked ? (
          <form
            action={unlockPrivateMemories}
            className="max-w-md rounded-3xl border border-[#FFD6E8] bg-white p-6 shadow-sm"
          >
            <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#FFD6E8] text-[#8c4058]">
              <Lock size={20} />
            </div>
            <h2 className="text-2xl font-semibold text-[#2d1b22]">
              Enter the private password.
            </h2>
            {params.error === "private-password" ? (
              <p className="mt-3 rounded-2xl bg-[#FFF7FA] px-4 py-3 text-sm font-semibold text-[#a1435e]">
                That password is not correct.
              </p>
            ) : null}
            <div className="mt-5 grid gap-3">
              <input
                name="password"
                type="password"
                required
                placeholder="Private password"
                className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
              />
              <button className="inline-flex w-fit items-center gap-2 rounded-full bg-[#FF8FAB] px-5 py-3 text-sm font-semibold text-white">
                <Unlock size={16} />
                Open private folder
              </button>
            </div>
          </form>
        ) : (
          <div className="grid gap-5">
            <form action={lockPrivateMemories} className="flex justify-end">
              <button className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#8c4058] ring-1 ring-[#FFD6E8]">
                Lock private folder
              </button>
            </form>
            <MemoriesWorkspace
              initialMemories={memories}
              currentPerson={currentPerson}
              privateMode
            />
          </div>
        )}
      </section>
    </PageShell>
  );
}
