import Image from "next/image";

export default async function LoginPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ error?: string; next?: string }>;
}>) {
  const params = await searchParams;
  const hasError = params.error === "1";
  const next = params.next ?? "/";

  return (
    <main className="grid min-h-screen place-items-center bg-[#FFF7FA] px-5 text-[#2d1b22]">
      <section className="w-full max-w-md rounded-[2rem] border border-[#FFD6E8] bg-white p-6 shadow-[0_24px_80px_rgba(255,143,171,0.22)]">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/jv-logo.png"
            alt="Jak and Vee logo"
            width={96}
            height={96}
            priority
            className="h-24 w-24 rounded-full object-cover shadow-sm ring-1 ring-[#FF8FAB]/25"
          />
          <p className="mt-5 text-sm font-semibold text-[#a1435e]">
            Forever Us
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Welcome Baby...</h1>
          <p className="mt-3 text-sm leading-6 text-[#765061]">
            Just me and you this home belongs to.
          </p>
        </div>

        <form action="/api/login" method="post" className="mt-6 grid gap-4">
          <input type="hidden" name="next" value={next} />
          <fieldset className="grid gap-2 text-sm font-semibold text-[#704153]">
            <legend>Who are you?</legend>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm font-semibold has-[:checked]:border-[#FF8FAB] has-[:checked]:bg-[#FFD6E8]">
                <input
                  type="radio"
                  name="person"
                  value="Jak"
                  required
                  className="sr-only"
                />
                Jak
              </label>
              <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm font-semibold has-[:checked]:border-[#FF8FAB] has-[:checked]:bg-[#FFD6E8]">
                <input
                  type="radio"
                  name="person"
                  value="Vee"
                  required
                  className="sr-only"
                />
                Vee
              </label>
            </div>
          </fieldset>
          <label className="grid gap-2 text-sm font-semibold text-[#704153]">
            Username
            <input
              name="username"
              required
              autoComplete="username"
              className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm font-normal outline-none focus:border-[#FF8FAB]"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-[#704153]">
            Password
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm font-normal outline-none focus:border-[#FF8FAB]"
            />
          </label>

          {hasError ? (
            <p className="rounded-2xl bg-[#FFF7FA] px-4 py-3 text-sm font-semibold text-[#a1435e]">
              That login did not match.
            </p>
          ) : null}

          <button className="rounded-full bg-[#FF8FAB] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#f47798]">
            Login
          </button>
        </form>
      </section>
    </main>
  );
}
