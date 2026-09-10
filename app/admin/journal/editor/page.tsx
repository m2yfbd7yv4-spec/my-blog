import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JournalForm } from "./JournalForm";
import type { JournalEntry } from "@/lib/types";

export default async function JournalEditorPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const id = typeof sp.id === "string" ? sp.id : undefined;

  let entry: JournalEntry | null = null;
  if (id) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("id", id)
      .single();
    if (!data) notFound();
    entry = data as JournalEntry;
  }

  return <JournalForm initial={entry} />;
}
