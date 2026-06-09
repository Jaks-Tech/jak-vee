import { Camera, UserRound } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { getCoupleProfiles } from "@/lib/profiles";
import { updateProfile } from "./actions";

export default async function ProfilesPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ error?: string; saved?: string }>;
}>) {
  const [params, profiles] = await Promise.all([
    searchParams,
    getCoupleProfiles(),
  ]);

  return (
    <PageShell>
      <section className="mx-auto w-full max-w-5xl px-5 pb-16 pt-8 sm:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold text-[#a1435e]">Profiles</p>
          <h1 className="mt-2 text-4xl font-semibold text-[#2d1b22]">
            Our little profile pictures.
          </h1>

          {params.saved ? (
            <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#8c4058]">
              Profile updated.
            </p>
          ) : null}
          {params.error ? (
            <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#a1435e]">
              Profile update failed. Please use an image and try again.
            </p>
          ) : null}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {profiles.map((profile) => (
            <article
              key={profile.person_name}
              className="rounded-3xl border border-[#FFD6E8] bg-white p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-[#FFD6E8] ring-4 ring-[#FFF7FA]">
                  {profile.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.avatar_url}
                      alt={`${profile.display_name} profile`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[#8c4058]">
                      <UserRound size={34} />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#a1435e]">
                    {profile.person_name}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-[#2d1b22]">
                    {profile.display_name}
                  </h2>
                  {profile.bio ? (
                    <p className="mt-2 text-sm leading-6 text-[#765061]">
                      {profile.bio}
                    </p>
                  ) : null}
                </div>
              </div>

              <form action={updateProfile} className="mt-6 grid gap-3">
                <input
                  type="hidden"
                  name="person_name"
                  value={profile.person_name}
                />
                <input
                  name="display_name"
                  defaultValue={profile.display_name}
                  placeholder="Display name"
                  className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
                />
                <textarea
                  name="bio"
                  defaultValue={profile.bio ?? ""}
                  placeholder="A tiny profile note"
                  className="min-h-24 resize-none rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
                />
                <div className="rounded-3xl border border-[#FFD6E8] bg-[#FFF7FA] p-4">
                  <p className="text-sm font-semibold text-[#a1435e]">
                    Mention notifications
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#765061]">
                    Add handles without spaces. Example: jak, j, babe. Then use
                    them as @jak or @babe anywhere in the app.
                  </p>
                  <input
                    name="mention_handles"
                    defaultValue={profile.mention_handles.join(", ")}
                    placeholder="jak, jaks, babe"
                    className="mt-3 w-full rounded-2xl border border-[#FFD6E8] bg-white px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
                  />
                  <input
                    name="discord_user_id"
                    defaultValue={profile.discord_user_id ?? ""}
                    placeholder="Optional Discord user ID"
                    className="mt-3 w-full rounded-2xl border border-[#FFD6E8] bg-white px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
                  />
                  <label className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#704153]">
                    <input
                      name="discord_mentions_enabled"
                      type="checkbox"
                      defaultChecked={profile.discord_mentions_enabled}
                      className="h-4 w-4 accent-[#FF8FAB]"
                    />
                    Send Discord mention notifications
                  </label>
                </div>
                <input
                  name="avatar"
                  type="file"
                  accept="image/*"
                  className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-[#FF8FAB] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                />
                <button className="inline-flex w-fit items-center gap-2 rounded-full bg-[#FF8FAB] px-5 py-3 text-sm font-semibold text-white">
                  <Camera size={16} />
                  Save profile
                </button>
              </form>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
