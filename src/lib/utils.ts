import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const trimText = (text: string, { length = 100, ellipsis = '' } = {}) => {
  if (text.length <= length) {
    return text;
  }
  return text.substring(0, length) + ellipsis;
};
