import { ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { getAdminData } from "@/lib/admin";
import { AdminConsole } from "./admin-console";

export default async function AdminPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ saved?: string; deleted?: string; error?: string }>;
}>) {
  const [params, sections] = await Promise.all([searchParams, getAdminData()]);

  return (
    <PageShell>
      <section className="mx-auto w-full max-w-7xl px-3 pb-16 pt-8 sm:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#a1435e]">
            <ShieldCheck size={16} />
            Where we&apos;re at
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-[#2d1b22]">
            Feed our little space, and keep it tidy
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#765061]">
            Choose a page from the side navigation, then open the item you want
            to add, edit, or delete.
          </p>
          {params.saved ? (
            <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#8c4058]">
              Admin change saved.
            </p>
          ) : null}
          {params.deleted ? (
            <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#8c4058]">
              Item deleted.
            </p>
          ) : null}
          {params.error ? (
            <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#a1435e]">
              Admin action failed. Check required fields and try again.
            </p>
          ) : null}
        </div>

        <AdminConsole sections={sections} />
      </section>
    </PageShell>
  );
}
