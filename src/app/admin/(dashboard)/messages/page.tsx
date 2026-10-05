import { Mail, Phone } from "lucide-react";

import { AdminPageHeader, Flash } from "@/components/admin/admin-ui";
import { MessageStatusSelect } from "@/components/admin/message-status-select";
import { listContactMessages } from "@/server/leads";
import { firstParam, type RawSearchParams } from "@/lib/search-params";
import { formatDate } from "@/lib/utils";

export default async function AdminMessagesPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const sp = await searchParams;
  const messages = await listContactMessages(200);
  const newCount = messages.filter((message) => message.status === "NEW").length;

  return (
    <>
      <AdminPageHeader
        title="Messages"
        description="General enquiries submitted through the contact form."
        actions={newCount ? <span className="badge border-accent-600/30 bg-accent-500/10 text-accent-700">{newCount} new</span> : undefined}
      />
      <Flash saved={sp.saved === "1"} />

      {messages.length === 0 ? (
        <div className="card px-6 py-14 text-center">
          <h2 className="text-base font-semibold text-ink-900">No messages yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-steel-600">
            Messages from the public contact form will appear here.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {messages.map((message) => (
            <li key={message.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-ink-900">{message.name}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-steel-500">
                    {message.subject ? <span className="font-medium text-steel-600">{message.subject}</span> : null}
                    {message.email ? (
                      <a href={`mailto:${message.email}`} className="inline-flex items-center gap-1 hover:text-ink-900">
                        <Mail className="h-3.5 w-3.5" aria-hidden />
                        {message.email}
                      </a>
                    ) : null}
                    {message.phone ? (
                      <a href={`tel:${message.phone}`} className="inline-flex items-center gap-1 hover:text-ink-900">
                        <Phone className="h-3.5 w-3.5" aria-hidden />
                        {message.phone}
                      </a>
                    ) : null}
                    <span>{formatDate(message.createdAt, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </p>
                </div>
                <MessageStatusSelect id={message.id} status={message.status} />
              </div>
              <p className="mt-4 whitespace-pre-line border-t border-steel-100 pt-4 text-sm text-steel-700">{message.message}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
