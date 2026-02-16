"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (content: string) => void;
  isSending: boolean;
}

export function ChatInput({ onSend, isSending }: ChatInputProps) {
  const t = useTranslations("chat");
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || isSending) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInput() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 96) + "px";
  }

  return (
    <div className="flex items-end gap-2 border-t p-3">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value.slice(0, 2000))}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder={t("placeholder")}
        rows={1}
        maxLength={2000}
        autoFocus={false}
        className={cn(
          "flex-1 resize-none rounded-xl border bg-transparent px-3 py-1.5 text-sm outline-none min-h-[36px]",
          "placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
        )}
      />
      <Button
        variant="accent"
        size="icon-sm"
        onClick={handleSend}
        disabled={!value.trim() || isSending}
        aria-label={t("send")}
        className="size-[36px] shrink-0"
      >
        <SendHorizonal className="size-4" />
      </Button>
    </div>
  );
}
