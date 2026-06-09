import { db } from "@/lib/db";

export type CoupleProfile = {
  person_name: "Jak" | "Vee";
  display_name: string;
  avatar_bucket: string;
  avatar_path: string | null;
  bio: string | null;
  mention_handles: string[];
  discord_user_id: string | null;
  discord_mentions_enabled: boolean;
  updated_at: string;
  avatar_url: string | null;
};

type ProfileRow = Omit<CoupleProfile, "avatar_url" | "updated_at"> & {
  updated_at: Date | string;
};

export async function getCoupleProfiles() {
  let result;

  try {
    result = await db.query<ProfileRow>(`
      select
        person_name,
        display_name,
        avatar_bucket,
        avatar_path,
        bio,
        mention_handles,
        discord_user_id,
        discord_mentions_enabled,
        updated_at
      from public.couple_profiles
      order by case person_name when 'Jak' then 1 else 2 end
    `);
  } catch {
    return [
      {
        person_name: "Jak" as const,
        display_name: "Jak",
        avatar_bucket: "avatars",
        avatar_path: null,
        bio: null,
        mention_handles: ["jak"],
        discord_user_id: null,
        discord_mentions_enabled: true,
        updated_at: new Date().toISOString(),
        avatar_url: null,
      },
      {
        person_name: "Vee" as const,
        display_name: "Vee",
        avatar_bucket: "avatars",
        avatar_path: null,
        bio: null,
        mention_handles: ["vee"],
        discord_user_id: null,
        discord_mentions_enabled: true,
        updated_at: new Date().toISOString(),
        avatar_url: null,
      },
    ];
  }

  return result.rows.map((profile) => ({
    ...profile,
    updated_at: new Date(profile.updated_at).toISOString(),
    avatar_url: profile.avatar_path
      ? `/api/profiles/avatar/${profile.person_name}`
      : null,
  }));
}

export async function getCoupleProfile(personName: string | undefined) {
  if (personName !== "Jak" && personName !== "Vee") return null;

  let result;

  try {
    result = await db.query<ProfileRow>(
      `
        select
          person_name,
          display_name,
          avatar_bucket,
          avatar_path,
          bio,
          mention_handles,
          discord_user_id,
          discord_mentions_enabled,
          updated_at
        from public.couple_profiles
        where person_name = $1
        limit 1
      `,
      [personName],
    );
  } catch {
    return {
      person_name: personName as "Jak" | "Vee",
      display_name: personName,
      avatar_bucket: "avatars",
      avatar_path: null,
      bio: null,
      mention_handles: [personName.toLowerCase()],
      discord_user_id: null,
      discord_mentions_enabled: true,
      updated_at: new Date().toISOString(),
      avatar_url: null,
    };
  }

  const profile = result.rows[0];
  if (!profile) return null;

  return {
    ...profile,
    updated_at: new Date(profile.updated_at).toISOString(),
    avatar_url: profile.avatar_path
      ? `/api/profiles/avatar/${profile.person_name}`
      : null,
  };
}
