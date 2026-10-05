import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Plus, Search } from "lucide-react";

import { AdminPageHeader, Flash } from "@/components/admin/admin-ui";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { Badge, Pagination, statusTone } from "@/components/ui/primitives";
import { getResource } from "@/lib/admin-resources";
import { countResourceRows, listResourceRows } from "@/server/admin/data";
import { deleteResourceAction } from "@/server/actions/admin";
import { firstParam, pageParam, type RawSearchParams } from "@/lib/search-params";
import { formatDate, humanize } from "@/lib/utils";

const PAGE_SIZE = 25;

function formatCell(value: unknown, type?: string): string {
  if (type === "date") return value ? formatDate(value as Date) : "—";
  if (type === "boolean") return value ? "Yes" : "No";
  if (type === "number") return value === null || value === undefined ? "—" : String(value);
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

export default async function AdminResourceListPage({
  params,
  searchParams,
}: {
  params: Promise<{ resource: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const { resource: resourceKey } = await params;
  const resource = getResource(resourceKey);
  if (!resource) notFound();

  const sp = await searchParams;
  const q = firstParam(sp, "q");
  const page = pageParam(sp);

  const [rows, total] = await Promise.all([
    listResourceRows(resource, q, PAGE_SIZE, (page - 1) * PAGE_SIZE),
    countResourceRows(resource, q),
  ]);

  return (
    <>
      <AdminPageHeader
        title={resource.label}
        description={resource.description}
        actions={
          <Link href={`/admin/${resource.key}/new`} className="btn btn-primary btn-sm">
            <Plus className="h-4 w-4" aria-hidden />
            Add {resource.singular.toLowerCase()}
          </Link>
        }
      />

      <Flash saved={sp.saved === "1"} deleted={sp.deleted === "1"} error={firstParam(sp, "error")} />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <form method="get" action={`/admin/${resource.key}`} role="search" className="flex gap-2">
          <label htmlFor="admin-search" className="sr-only">
            Search {resource.label}
          </label>
          <input
            id="admin-search"
            name="q"
            type="search"
            defaultValue={q ?? ""}
            placeholder={`Search ${resource.label.toLowerCase()}…`}
            className="field max-w-xs"
          />
          <button type="submit" className="btn btn-dark btn-sm shrink-0">
            <Search className="h-4 w-4" aria-hidden />
            Search
          </button>
          {q ? (
            <Link href={`/admin/${resource.key}`} className="btn btn-ghost btn-sm">
              Clear
            </Link>
          ) : null}
        </form>
        <p className="text-xs text-steel-500">
          {total} record{total === 1 ? "" : "s"}
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="card px-6 py-14 text-center">
          <h2 className="text-base font-semibold text-ink-900">
            {q ? `No results for “${q}”` : `No ${resource.label.toLowerCase()} yet`}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-steel-600">
            {q ? "Try a different search term." : `Create the first ${resource.singular.toLowerCase()} to get started.`}
          </p>
          <Link href={`/admin/${resource.key}/new`} className="btn btn-primary mt-5">
            <Plus className="h-4 w-4" aria-hidden />
            Add {resource.singular.toLowerCase()}
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <caption className="sr-only">{resource.label} list</caption>
              <thead>
                <tr>
                  {resource.columns.map((column) => (
                    <th key={column.name} scope="col">
                      {column.label}
                    </th>
                  ))}
                  <th scope="col" className="text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const id = String(row.id);
                  const title = String(row[resource.titleField] ?? id);
                  return (
                    <tr key={id}>
                      {resource.columns.map((column, index) => {
                        const value = row[column.name];
                        return (
                          <td key={column.name} className="align-top">
                            {column.type === "status" ? (
                              <Badge tone={statusTone(String(value))}>{humanize(String(value))}</Badge>
                            ) : index === 0 ? (
                              <Link href={`/admin/${resource.key}/${id}`} className="font-medium text-ink-900 hover:text-accent-700">
                                {formatCell(value, column.type)}
                              </Link>
                            ) : (
                              <span className="text-steel-600">{formatCell(value, column.type)}</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="align-top">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/${resource.key}/${id}`}
                            className="btn btn-outline btn-sm"
                            aria-label={`Edit ${title}`}
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden />
                            Edit
                          </Link>
                          <form action={deleteResourceAction}>
                            <input type="hidden" name="resourceKey" value={resource.key} />
                            <input type="hidden" name="id" value={id} />
                            <ConfirmSubmit message={`Delete “${title}”? This cannot be undone.`}>Delete</ConfirmSubmit>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        baseHref={`/admin/${resource.key}`}
        params={{ q }}
        className="mt-6"
      />
    </>
  );
}
