"use client";

import { useTransition } from "react";

import { updateMessageAction } from "@/server/actions/admin";
import { MESSAGE_STATUSES } from "@/types";

/** Inline status control for the messages list. */
export function MessageStatusSelect({ id, status }: { id: string; status: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={pending}
      aria-label="Message status"
      className="field min-w-32 py-1.5 text-xs"
      onChange={(event) => {
        const value = event.target.value;
        startTransition(async () => {
          await updateMessageAction(id, value);
        });
      }}
    >
      {MESSAGE_STATUSES.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
