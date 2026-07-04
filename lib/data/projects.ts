import type { Project as SanityProject } from '@/types/sanity';
import { apigen } from './case-studies/apigen';
import { apigenStudio } from './case-studies/apigen-studio';
import { biogasPlatform } from './case-studies/biogas-platform';

const LOCAL_PROJECTS: SanityProject[] = [apigen, apigenStudio, biogasPlatform];

function getProjectTimestamp(project: SanityProject): number {
  return new Date(project.publishedAt).getTime();
}

// Curated projects with an explicit displayOrder lead (ascending); everything
// else (GitHub/Sanity-only) follows, sorted by publishedAt descending.
function compareProjects(left: SanityProject, right: SanityProject): number {
  const lo = left.displayOrder ?? Number.POSITIVE_INFINITY;
  const ro = right.displayOrder ?? Number.POSITIVE_INFINITY;
  if (lo !== ro) return lo - ro;
  return getProjectTimestamp(right) - getProjectTimestamp(left);
}

/**
 * Hybrid merge: Sanity stays the source of truth for CMS-managed fields
 * (image, URLs, technologies, featured, dates, excerpt) so nothing authored in
 * Studio is discarded. The version-controlled local case study only contributes
 * the prose `body` — where the architecture diagrams live — and fills any field
 * Sanity left empty. Projects that exist only in Sanity or only locally render
 * entirely from their single source.
 */
export function mergeLocalAndSanityProjects(remoteProjects: SanityProject[]): SanityProject[] {
  const projectMap = new Map<string, SanityProject>();
  const localBySlug = new Map(LOCAL_PROJECTS.map((project) => [project.slug.current, project]));

  for (const remote of remoteProjects) {
    const local = localBySlug.get(remote.slug.current);
    if (local) {
      // Field-level merge: keep all Sanity fields, but let the curated local
      // body (with diagrams) win when present, and fall back to the local
      // displayOrder when Sanity didn't author one.
      projectMap.set(remote.slug.current, {
        ...remote,
        body: local.body && local.body.length > 0 ? local.body : remote.body,
        bodyEn: local.bodyEn && local.bodyEn.length > 0 ? local.bodyEn : remote.bodyEn,
        excerptEn: local.excerptEn ?? remote.excerptEn,
        displayOrder: remote.displayOrder ?? local.displayOrder,
      });
    } else {
      projectMap.set(remote.slug.current, remote);
    }
  }

  // Local-only projects (absent from Sanity) render entirely from local.
  for (const project of LOCAL_PROJECTS) {
    if (!projectMap.has(project.slug.current)) {
      projectMap.set(project.slug.current, project);
    }
  }

  return Array.from(projectMap.values()).sort(compareProjects);
}
