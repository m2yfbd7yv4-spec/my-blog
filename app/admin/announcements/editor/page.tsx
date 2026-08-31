import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AnnouncementForm } from "./AnnouncementForm";
import type { Announcement } from "@/lib/types";

export default async function AnnouncementEditorPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const id = typeof sp.id === "string" ? sp.id : undefined;

  let announcement: Announcement | null = null;
  if (id) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .eq("id", id)
      .single();
    if (!data) notFound();
    announcement = data as Announcement;
  }

  return <AnnouncementForm initial={announcement} />;
}
