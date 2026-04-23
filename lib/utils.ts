import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isLockedByOther(
  lockedBy: string | null,
  lockedAt: string | null,
  currentUserId: string,
  serverNow?: string
) {
  if (!lockedBy || lockedBy === currentUserId) return false;
  if (!lockedAt) return false;

  const lockTime = new Date(lockedAt).getTime();
  const now = serverNow ? new Date(serverNow).getTime() : new Date().getTime();
  const twoHoursInMs = 2 * 60 * 60 * 1000;

  return now - lockTime < twoHoursInMs;
}

export function timeAgo(date: string | Date) {
  const now = new Date().getTime();
  const past = new Date(date).getTime();
  const diffInMs = now - past;

  const seconds = Math.floor(diffInMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}
