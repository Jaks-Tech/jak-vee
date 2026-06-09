import { cookies } from "next/headers";
import { PageShell } from "@/components/page-shell";
import { getChatMessages } from "@/lib/chat";
import { ChatRoom } from "./chat-room";

export default async function ChatPage() {
  const cookieStore = await cookies();
  const currentPerson = cookieStore.get("jak_vee_person")?.value;
  const messages = await getChatMessages();

  return (
    <PageShell>
      <section className="mx-auto w-full max-w-5xl px-5 pb-16 pt-8 sm:px-8">
        <ChatRoom
          initialMessages={messages}
          currentPerson={currentPerson}
        />
      </section>
    </PageShell>
  );
}
