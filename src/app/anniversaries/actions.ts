"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { sendMentionNotification } from "@/lib/mentions";

const defaultEventTypes = new Set([
  "Anniversary",
  "Trip",
  "Special day",
  "Date",
  "Birthday",
  "Monthly celebration",
  "Surprise",
  "Promise",
  "Custom",
]);

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readRecipients(formData: FormData) {
  return readText(formData, "email_recipients")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean)
    .slice(0, 8);
}

export async function createAnniversaryReminder(formData: FormData) {
  const cookieStore = await cookies();
  const authorName = cookieStore.get("jak_vee_person")?.value;
  const title = readText(formData, "title");
  const dateValue = readText(formData, "date_value");
  const eventTime = readText(formData, "event_time") || "09:00";
  const selectedType = readText(formData, "event_type");
  const customType = readText(formData, "custom_event_type")
    .replace(/\s+/g, " ")
    .slice(0, 60);
  const reminderRule = readText(formData, "reminder_rule") || "yearly";
  const notes = readText(formData, "notes") || null;
  const emailEnabled = readText(formData, "email_enabled") === "on";
  const emailRecipients = readRecipients(formData);
  const emailSubject = readText(formData, "email_subject") || null;
  const emailMessage = readText(formData, "email_message") || null;

  if (!authorName || !["Jak", "Vee"].includes(authorName)) {
    redirect("/login");
  }

  const eventType =
    selectedType === "Custom"
      ? customType
      : defaultEventTypes.has(selectedType)
        ? selectedType
        : "";

  if (
    !title ||
    !dateValue ||
    !eventType ||
    !["once", "monthly", "yearly"].includes(reminderRule)
  ) {
    redirect("/anniversaries?error=missing");
  }

  if (emailEnabled && emailRecipients.length === 0) {
    redirect("/anniversaries?error=email");
  }

  try {
    await db.query(
      `
        insert into public.anniversaries (
          title,
          date_value,
          event_time,
          event_type,
          reminder_rule,
          notes,
          author_name,
          email_enabled,
          email_recipients,
          email_subject,
          email_message
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `,
      [
        title,
        dateValue,
        eventTime,
        eventType,
        reminderRule,
        notes,
        authorName,
        emailEnabled,
        emailRecipients,
        emailSubject,
        emailMessage,
      ],
    );
    await sendMentionNotification({
      authorName,
      sourceType: "Reminders",
      sourceTitle: title,
      body: [notes, emailMessage].filter(Boolean).join("\n"),
      path: "/anniversaries",
    });
  } catch (error) {
    console.error(error);
    redirect("/anniversaries?error=save");
  }

  revalidatePath("/anniversaries");
  redirect("/anniversaries?saved=1");
}
