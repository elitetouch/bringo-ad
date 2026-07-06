"use client";

import { useFormStatus } from "react-dom";

const VARIANTS = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  success: "bg-success-50 text-success-600 hover:bg-success-100",
  danger: "bg-danger-50 text-danger-600 hover:bg-danger-100",
  neutral: "bg-gray-100 text-gray-700 hover:bg-gray-200",
} as const;

export function SubmitButton({
  children,
  variant = "neutral",
  pendingText,
}: {
  children: React.ReactNode;
  variant?: keyof typeof VARIANTS;
  pendingText?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${VARIANTS[variant]}`}
    >
      {pending ? pendingText ?? "Working…" : children}
    </button>
  );
}
