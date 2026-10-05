import Link from "next/link";

import { AdminPageHeader, Flash } from "@/components/admin/admin-ui";
import { Badge, statusTone } from "@/components/ui/primitives";
import { listServiceRequests } from "@/server/leads";
import { SERVICE_STATUSES } from "@/types";
import { firstParam, type RawSearchParams } from "@/lib/search-params";
import { formatDate, humanize, truncate } from "@/lib/utils";

export default async function AdminServiceRequestsPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const sp = await searchParams;
  const status = firstParam(sp, "status");
  const all = await listServiceRequests(200);
  const requests = status && SERVICE_STATUSES.includes(status as never)
    ? all.filter((request) => request.status === status)
    : all;

  return (
    <>
      <AdminPageHeader title="Service requests" description="Machine faults, maintenance and support requests." />
      <Flash saved={sp.saved === "1"} error={firstParam(sp, "error")} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link
          href="/admin/service-requests"
          className={`border px-3 py-1.5 text-xs font-medium ${
            !status ? "border-ink-900 bg-ink-900 text-white" : "border-steel-200 text-steel-600 hover:border-ink-900 hover:text-ink-900"
          }`}
        >
          All
        </Link>
        {SERVICE_STATUSES.map((option) => (
          <Link
            key={option}
            href={`/admin/service-requests?status=${option}`}
            className={`border px-3 py-1.5 text-xs font-medium ${
              status === option
                ? "border-ink-900 bg-ink-900 text-white"
                : "border-steel-200 text-steel-600 hover:border-ink-900 hover:text-ink-900"
            }`}
          >
            {humanize(option)}
          </Link>
        ))}
        <span className="ml-auto text-xs text-steel-500">{requests.length} request{requests.length === 1 ? "" : "s"}</span>
      </div>

      {requests.length === 0 ? (
        <div className="card px-6 py-14 text-center">
          <h2 className="text-base font-semibold text-ink-900">No service requests</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-steel-600">
            Requests submitted through the service request form will appear here.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <caption className="sr-only">Service requests</caption>
              <thead>
                <tr>
                  <th scope="col">Reference</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Machine</th>
                  <th scope="col">Problem</th>
                  <th scope="col">Status</th>
                  <th scope="col">Received</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td className="align-top font-mono text-xs">
                      <Link href={`/admin/service-requests/${request.id}`} className="text-ink-900 hover:text-accent-700">
                        {request.reference}
                      </Link>
                    </td>
                    <td className="align-top">
                      <Link
                        href={`/admin/service-requests/${request.id}`}
                        className="font-medium text-ink-900 hover:text-accent-700"
                      >
                        {request.customerName}
                      </Link>
                      <p className="text-xs text-steel-500">{[request.company, request.phone].filter(Boolean).join(" · ") || "—"}</p>
                    </td>
                    <td className="align-top text-steel-600">{request.machine || "—"}</td>
                    <td className="align-top text-steel-600">{truncate(request.problem, 50)}</td>
                    <td className="align-top">
                      <Badge tone={statusTone(request.status)}>{humanize(request.status)}</Badge>
                    </td>
                    <td className="align-top whitespace-nowrap text-xs text-steel-500">{formatDate(request.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
