import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: any): string {
  // Convert to number strictly to handle Decimal objects or strings from API
  const numAmount = Number(amount) || 0

  // Use a consistent format for both server and client to avoid hydration errors
  // C$ = Córdoba Nicaragüense
  const formatted = numAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  return `C$${formatted}`
}
