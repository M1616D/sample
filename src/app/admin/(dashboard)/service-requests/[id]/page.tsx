import { notFound } from "next/navigation";
import { Mail, Phone } from "lucide-react";

import { AdminPageHeader, Flash } from "@/components/admin/admin-ui";
import { LeadUpdateForm } from "@/components/admin/lead-update-form";
import { Badge, statusTone } from "@/components/ui/primitives";
import { getServiceRequest } from "@/server/leads";
import { SERVICE_STATUSES } from "@/types";
import { formatDate, humanize, telHref } from "@/lib/utils";

const statusOptions = SERVICE_STATUSES.map((value) => ({ value, label: humanize(value) }));

export default async function AdminServiceRequestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const request = await getServiceRequest(id);
  if (!request) notFound();

  const rows: { label: string; value: string }[] = [
    { label: "Company", value: request.company || "—" },
    { label: "Machine", value: request.machine || "—" },
    { label: "Serial number", value: request.serialNumber || "—" },
    { label: "Location", value: request.location || "—" },
  ];

  return (
    <>
      <AdminPageHeader
        title={request.customerName}
        description={`Reference ${request.reference} · received ${formatDate(request.createdAt, { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}`}
        back={{ href: "/admin/service-requests", label: "All service requests" }}
        actions={<Badge tone={statusTone(request.status)}>{humanize(request.status)}</Badge>}
      />

      <Flash saved={sp.saved === "1"} />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <div className="card p-5 sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-steel-500">Contact</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {request.phone ? (
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 shrink-0 text-steel-400" aria-hidden />
                  <a href={telHref(request.phone)} className="text-ink-900 hover:text-accent-700">
                    {request.phone}
                  </a>
                </li>
              ) : null}
              {request.email ? (
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 shrink-0 text-steel-400" aria-hidden />
                  <a href={`mailto:${request.email}`} className="break-all text-ink-900 hover:text-accent-700">
                    {request.email}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>

          <div className="card p-5 sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-steel-500">Reported problem</h2>
            <p className="mt-3 text-sm font-medium text-ink-900">{request.problem}</p>
            <div className="prose-industrial mt-4 whitespace-pre-line text-sm">{request.description}</div>
            {request.photos.length ? (
              <div className="mt-5 border-t border-steel-100 pt-4">
                <p className="text-2xs font-semibold uppercase tracking-wider text-steel-500">Photo links</p>
                <ul className="mt-2 space-y-1">
                  {request.photos.map((photo) => (
                    <li key={photo}>
                      <a
                        href={photo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all text-xs text-sky-700 hover:underline"
                      >
                        {photo}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="card overflow-hidden">
            <h2 className="border-b border-steel-200 px-5 py-4 text-sm font-semibold uppercase tracking-wide text-steel-500">
              Machine details
            </h2>
            <dl>
              {rows.map((row) => (
                <div key={row.label} className="spec-row border-b border-steel-100 px-5">
                  <dt className="spec-label">{row.label}</dt>
                  <dd className="spec-value break-all">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="card p-5 sm:p-6 lg:sticky lg:top-24">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-steel-500">Workflow</h2>
            <div className="mt-4">
              <LeadUpdateForm
                kind="service"
                id={request.id}
                status={request.status}
                assignedTo={request.assignedTo}
                internalNotes={request.internalNotes}
                statusOptions={statusOptions}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
