import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Gerade eben";
  if (diffMins < 60) return `vor ${diffMins} Min.`;
  if (diffHours < 24) return `vor ${diffHours} Std.`;
  if (diffDays < 7) return `vor ${diffDays} Tag${diffDays > 1 ? "en" : ""}`;
  return date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getChannelColor(channel: string): string {
  const map: Record<string, string> = {
    whatsapp: "#25d366",
    instagram: "#e1306c",
    voice: "#f59e0b",
    email: "#38bdf8",
    sms: "#8b5cf6",
  };
  return map[channel?.toLowerCase()] || "#94a3b8";
}

export function getChannelClass(channel: string): string {
  const map: Record<string, string> = {
    whatsapp: "badge-whatsapp",
    instagram: "badge-instagram",
    voice: "badge-voice",
    email: "badge-email",
    sms: "badge-purple",
  };
  return map[channel?.toLowerCase()] || "badge-gray";
}

export function getStatusClass(status: string): string {
  const map: Record<string, string> = {
    beantwortet: "badge-success",
    offen: "badge-warning",
    gebucht: "badge-success",
    storniert: "badge-danger",
    ausstehend: "badge-warning",
    aktiv: "badge-success",
    inaktiv: "badge-gray",
  };
  return map[status?.toLowerCase()] || "badge-gray";
}
