import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-ui";
import { ResourceForm } from "@/components/admin/resource-form";
import { getResource } from "@/lib/admin-resources";
import { getResourceRow, rowToFormValues, withResolvedOptions } from "@/server/admin/data";

export default async function AdminResourceEditPage({
  params,
}: {
  params: Promise<{ resource: string; id: string }>;
}) {
  const { resource: resourceKey, id } = await params;
  const base = getResource(resourceKey);
  if (!base) notFound();

  const row = await getResourceRow(base, id);
  if (!row) notFound();

  const resource = await withResolvedOptions(base);
  const values = rowToFormValues(resource, row);

  return (
    <>
      <AdminPageHeader
        title={`Edit ${resource.singular.toLowerCase()}`}
        description={String(row[resource.titleField] ?? "")}
        back={{ href: `/admin/${resource.key}`, label: `Back to ${resource.label.toLowerCase()}` }}
      />

      <div className="card p-5 sm:p-7">
        <ResourceForm
          resourceKey={resource.key}
          id={id}
          singular={resource.singular}
          fields={resource.fields}
          values={values}
          slugFrom={resource.slugFrom}
        />
      </div>
    </>
  );
}
