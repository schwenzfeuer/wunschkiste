"use client";

import { useState, useEffect } from "react";
import { useRouter, Link } from "@/i18n/routing";
import { useSession } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { MainNav } from "@/components/main-nav";
import { de } from "date-fns/locale";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { OwnerVisibility } from "@/lib/db/schema";

export default function NewWishlistForm() {
  const t = useTranslations("newWishlist");
  const tVis = useTranslations("visibility");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState("standard");
  const [eventDate, setEventDate] = useState<Date | undefined>();
  const [ownerVisibility, setOwnerVisibility] = useState<OwnerVisibility>("partial");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const visibilityOptions: { value: OwnerVisibility; label: string; description: string }[] = [
    { value: "full", label: tVis("full"), description: tVis("fullDescription") },
    { value: "partial", label: tVis("partial"), description: tVis("partialDescription") },
    { value: "surprise", label: tVis("surprise"), description: tVis("surpriseDescription") },
  ];

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const response = await fetch("/api/wishlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: description || undefined,
        theme,
        eventDate: eventDate?.toISOString() ?? null,
        ownerVisibility,
      }),
    });

    if (!response.ok) {
      setError(t("error"));
      setLoading(false);
      return;
    }

    const wishlist = await response.json();
    router.push({ pathname: "/wishlist/[id]", params: { id: wishlist.id } });
  }

  if (isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-foreground/40">{tCommon("loading")}</p>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen">
      <MainNav />

      <div className="mx-auto max-w-xl px-4 pt-28 pb-12 sm:px-6 sm:pt-36">
        <h1 className="font-serif text-3xl md:text-4xl">{t("title")}</h1>
        <p className="mt-2 text-foreground/50">
          {t("subtitle")}
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-8">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Theme Selection - MVP deaktiviert, Code bleibt erhalten */}

          <div className="space-y-2">
            <Label htmlFor="title">{t("titleLabel")}</Label>
            <Input
              id="title"
              placeholder={t("titlePlaceholder")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={100}
              className="h-11 rounded-lg border-2 bg-card"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("descriptionLabel")}</Label>
            <Textarea
              id="description"
              placeholder={t("descriptionPlaceholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              className="rounded-lg border-2 bg-card"
            />
          </div>

          {/* Event Date */}
          <div className="space-y-2">
            <Label>{t("eventDateLabel")}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full h-11 justify-start text-left font-normal rounded-lg border-2 bg-card",
                    !eventDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 size-4" />
                  {eventDate ? format(eventDate, "PPP", { locale: de }) : t("selectDate")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={eventDate}
                  onSelect={setEventDate}
                  locale={de}
                />
              </PopoverContent>
            </Popover>
            {eventDate && (
              <button
                type="button"
                onClick={() => setEventDate(undefined)}
                className="inline-flex items-center gap-1 text-xs text-foreground/50 hover:text-foreground"
              >
                <X className="size-3" />
                {t("removeDate")}
              </button>
            )}
          </div>

          {/* Owner Visibility */}
          <div className="space-y-3">
            <Label>{t("visibilityLabel")}</Label>
            <div className="space-y-2">
              {visibilityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setOwnerVisibility(option.value)}
                  className={`w-full rounded-xl border-2 p-3 text-left transition-all ${
                    ownerVisibility === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <span className="text-sm font-medium">{option.label}</span>
                  <p className="mt-0.5 text-xs text-foreground/50">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Link href="/dashboard">
              <Button type="button" variant="ghost">
                {tCommon("cancel")}
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading || !title}
            >
              {loading ? t("creating") : t("create")}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
