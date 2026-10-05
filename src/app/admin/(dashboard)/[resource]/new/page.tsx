import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-ui";
import { ResourceForm } from "@/components/admin/resource-form";
import { getResource } from "@/lib/admin-resources";
import { rowToFormValues, withResolvedOptions } from "@/server/admin/data";

export default async function AdminResourceCreatePage({ params }: { params: Promise<{ resource: string }> }) {
  const { resource: resourceKey } = await params;
  const base = getResource(resourceKey);
  if (!base) notFound();

  const resource = await withResolvedOptions(base);
  const values = rowToFormValues(resource, null);

  return (
    <>
      <AdminPageHeader
        title={`New ${resource.singular.toLowerCase()}`}
        description={`Create a new ${resource.singular.toLowerCase()}. Fields marked * are required.`}
        back={{ href: `/admin/${resource.key}`, label: `Back to ${resource.label.toLowerCase()}` }}
      />

      <div className="card p-5 sm:p-7">
        <ResourceForm
          resourceKey={resource.key}
          id=""
          singular={resource.singular}
          fields={resource.fields}
          values={values}
          slugFrom={resource.slugFrom}
        />
      </div>
    </>
  );
}
