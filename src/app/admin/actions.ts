"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAdminEntity } from "@/lib/admin";
import { createLoveDrop } from "@/lib/love-drops";

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function valueFor(formData: FormData, fieldName: string, type?: string) {
  if (type === "checkbox") return readText(formData, fieldName) === "on";
  const value = readText(formData, fieldName);
  if (!value) return null;
  if (fieldName === "email_recipients" || fieldName === "mention_handles") {
    return value
      .split(",")
      .map((item) =>
        fieldName === "mention_handles"
          ? item.trim().replace(/^@+/, "").toLowerCase()
          : item.trim(),
      )
      .filter(Boolean);
  }
  return value;
}

function redirectBack(status: string): never {
  revalidatePath("/admin");
  redirect(`/admin?${status}=1`);
}

export async function createAdminRow(formData: FormData) {
  const entityKey = readText(formData, "entity");
  const entity = getAdminEntity(entityKey);

  if (!entity) redirectBack("error");

  const columns: string[] = [];
  const values: unknown[] = [];

  for (const field of entity.fields) {
    const value = valueFor(formData, field.name, field.type);
    const defaultValue = entity.createDefaults?.[field.name];
    if (value === null && defaultValue === undefined && !field.required) continue;
    columns.push(field.name);
    values.push(value ?? defaultValue ?? null);
  }

  for (const [key, value] of Object.entries(entity.createDefaults ?? {})) {
    if (columns.includes(key)) continue;
    columns.push(key);
    values.push(value);
  }

  if (columns.length === 0) redirectBack("error");

  const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");

  try {
    await db.query(
      `insert into ${entity.table} (${columns.join(", ")}) values (${placeholders})`,
      values,
    );
  } catch (error) {
    console.error(error);
    redirectBack("error");
  }

  redirectBack("saved");
}

export async function updateAdminRow(formData: FormData) {
  const entityKey = readText(formData, "entity");
  const id = readText(formData, "id");
  const entity = getAdminEntity(entityKey);

  if (!entity || !id) redirectBack("error");

  const updates: string[] = [];
  const values: unknown[] = [];

  for (const field of entity.fields) {
    if (field.name === "person_name") continue;
    updates.push(`${field.name} = $${updates.length + 1}`);
    values.push(valueFor(formData, field.name, field.type));
  }

  if (updates.length === 0) redirectBack("error");

  values.push(id);
  const idColumn = entity.key === "couple_profiles" ? "person_name" : "id";

  try {
    await db.query(
      `update ${entity.table} set ${updates.join(", ")} where ${idColumn} = $${values.length}`,
      values,
    );
  } catch (error) {
    console.error(error);
    redirectBack("error");
  }

  redirectBack("saved");
}

export async function deleteAdminRow(formData: FormData) {
  const entityKey = readText(formData, "entity");
  const id = readText(formData, "id");
  const entity = getAdminEntity(entityKey);

  if (!entity || !id) redirectBack("error");

  const idColumn = entity.key === "couple_profiles" ? "person_name" : "id";

  try {
    await db.query(`delete from ${entity.table} where ${idColumn} = $1`, [id]);
  } catch (error) {
    console.error(error);
    redirectBack("error");
  }

  redirectBack("deleted");
}

export async function testLoveDrop() {
  try {
    await createLoveDrop({ notify: true });
  } catch (error) {
    console.error(error);
    redirectBack("error");
  }

  redirectBack("love-drop");
}
