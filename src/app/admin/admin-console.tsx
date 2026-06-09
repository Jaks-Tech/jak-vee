"use client";

import { ChevronDown, Trash2 } from "lucide-react";
import { useState } from "react";
import type { AdminEntity, AdminField, AdminRow } from "@/lib/admin";
import { createAdminRow, deleteAdminRow, updateAdminRow } from "./actions";

type AdminSection = {
  entity: AdminEntity;
  rows: AdminRow[];
  error: string | null;
};

function rowId(entityKey: string, row: AdminRow) {
  return String(entityKey === "couple_profiles" ? row.person_name : row.id);
}

function fieldValue(row: AdminRow, field: AdminField) {
  const value = row[field.name];
  if (value === null || value === undefined) return "";
  if (field.type === "date") return String(value).slice(0, 10);
  if (field.type === "time") return String(value).slice(0, 5);
  if (field.type === "datetime-local") return String(value).slice(0, 16);
  return String(value);
}

function AdminInput({
  field,
  row,
}: Readonly<{
  field: AdminField;
  row?: AdminRow;
}>) {
  const value = row ? fieldValue(row, field) : "";
  const className =
    "min-w-0 w-full rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]";

  if (field.type === "textarea") {
    return (
      <label className="grid gap-2 text-xs font-semibold text-[#704153]">
        {field.label}
        <textarea
          name={field.name}
          required={field.required}
          defaultValue={value}
          placeholder={field.placeholder}
          className={`${className} min-h-24 resize-none`}
        />
      </label>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="inline-flex items-center gap-2 rounded-2xl bg-[#FFF7FA] px-4 py-3 text-xs font-semibold text-[#704153]">
        <input
          name={field.name}
          type="checkbox"
          defaultChecked={Boolean(row?.[field.name])}
          className="h-4 w-4 accent-[#FF8FAB]"
        />
        {field.label}
      </label>
    );
  }

  return (
    <label className="grid gap-2 text-xs font-semibold text-[#704153]">
      {field.label}
      <input
        name={field.name}
        type={field.type ?? "text"}
        required={field.required}
        defaultValue={value}
        placeholder={field.placeholder}
        className={className}
      />
    </label>
  );
}

export function AdminConsole({
  sections,
}: Readonly<{
  sections: AdminSection[];
}>) {
  const [activeKey, setActiveKey] = useState(sections[0]?.entity.key ?? "");
  const activeSection =
    sections.find((section) => section.entity.key === activeKey) ?? sections[0];

  if (!activeSection) return null;

  const { entity, rows, error } = activeSection;

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
      <aside className="sticky top-4 z-10 min-w-0 overflow-hidden rounded-3xl border border-[#FFD6E8] bg-white p-3 shadow-sm sm:p-4">
        <p className="px-2 text-xs font-semibold uppercase tracking-wide text-[#a1435e]">
          Pages
        </p>
        <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:grid lg:overflow-visible lg:pb-0">
          {sections.map((section) => {
            const isActive = section.entity.key === activeKey;

            return (
              <button
                key={section.entity.key}
                type="button"
                onClick={() => setActiveKey(section.entity.key)}
                className={[
                  "inline-flex min-w-36 shrink-0 items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition lg:w-full lg:min-w-0",
                  isActive
                    ? "bg-[#FF8FAB] text-white"
                    : "bg-[#FFF7FA] text-[#7f4357] hover:bg-[#FFD6E8]",
                ].join(" ")}
              >
                <span className="truncate">{section.entity.title}</span>
                <span
                  className={[
                    "rounded-full px-2 py-1 text-xs",
                    isActive ? "bg-white/20 text-white" : "bg-white text-[#a1435e]",
                  ].join(" ")}
                >
                  {section.rows.length}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="min-w-0 overflow-hidden rounded-3xl border border-[#FFD6E8] bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#a1435e]">
              {entity.title}
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-[#2d1b22]">
              {rows.length} saved
            </h2>
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-2xl bg-[#FFF7FA] px-4 py-3 text-sm font-semibold text-[#a1435e]">
            {error}
          </p>
        ) : null}

        <details className="mt-5 min-w-0 rounded-3xl border border-[#FFD6E8] bg-[#FFF7FA] p-4">
          <summary className="cursor-pointer text-sm font-semibold text-[#8c4058]">
            Add new {entity.title.toLowerCase()}
          </summary>
          <form action={createAdminRow} className="mt-4 grid min-w-0 gap-3 md:grid-cols-2">
            <input type="hidden" name="entity" value={entity.key} />
            {entity.fields.map((field) => (
              <AdminInput key={field.name} field={field} />
            ))}
            <button className="inline-flex w-fit items-center justify-center rounded-full bg-[#FF8FAB] px-5 py-3 text-sm font-semibold text-white md:col-span-2">
              Add
            </button>
          </form>
        </details>

        <div className="mt-5 grid gap-4">
          {rows.map((row) => (
            <details
              key={rowId(entity.key, row)}
              className="min-w-0 rounded-3xl border border-[#FFD6E8] bg-[#FFF7FA] p-4"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#2d1b22]">
                    {String(row.title ?? row.display_name ?? row.body ?? rowId(entity.key, row))}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[#a1435e]">
                    ID: {rowId(entity.key, row)}
                  </p>
                </div>
                <ChevronDown size={17} className="shrink-0 text-[#8c4058]" />
              </summary>

              <div className="mt-4 flex justify-end">
                <form action={deleteAdminRow}>
                  <input type="hidden" name="entity" value={entity.key} />
                  <input type="hidden" name="id" value={rowId(entity.key, row)} />
                  <button
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#a1435e]"
                    aria-label="Delete item"
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </form>
              </div>

              <form action={updateAdminRow} className="mt-4 grid min-w-0 gap-3 md:grid-cols-2">
                <input type="hidden" name="entity" value={entity.key} />
                <input type="hidden" name="id" value={rowId(entity.key, row)} />
                {entity.fields.map((field) => (
                  <AdminInput key={field.name} field={field} row={row} />
                ))}
                <button className="inline-flex w-fit items-center justify-center rounded-full bg-[#FF8FAB] px-5 py-3 text-sm font-semibold text-white md:col-span-2">
                  Save changes
                </button>
              </form>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
