import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

import { MediaImage } from "@/components/media/media-image";
import { Badge } from "@/components/ui/primitives";
import type { ProjectDTO } from "@/types";
import { formatDate } from "@/lib/utils";

export function ProjectCard({ project, priority = false }: { project: ProjectDTO; priority?: boolean }) {
  const dateLabel = formatDate(project.date, { year: "numeric", month: "long" });
  return (
    <article className="card card-hover group flex flex-col overflow-hidden">
      <Link href={`/projects/${project.slug}`} className="block">
        <MediaImage
          src={project.images[0]}
          alt={project.title}
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2.5 flex flex-wrap items-center gap-2">
          {project.categoryName ? <Badge tone="neutral">{project.categoryName}</Badge> : null}
          {dateLabel ? <span className="text-2xs uppercase tracking-wider text-steel-500">{dateLabel}</span> : null}
        </div>
        <h3 className="text-base font-semibold leading-snug text-ink-900">
          <Link href={`/projects/${project.slug}`} className="transition-colors hover:text-accent-700">
            {project.title}
          </Link>
        </h3>
        {project.summary ? (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-steel-600">{project.summary}</p>
        ) : null}
        {project.location ? (
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-steel-500">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            {project.location}
          </p>
        ) : null}
        <Link
          href={`/projects/${project.slug}`}
          className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-ink-900 transition-colors hover:text-accent-700"
        >
          Read the project
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
