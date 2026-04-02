import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, desc, count, max } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.module';
import { articleVersions, articles } from '../database/schema';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type * as schema from '../database/schema';

@Injectable()
export class WorkflowsService {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>) {}

  /**
   * Save a new version before updating an article
   */
  async saveVersion(articleId: number, editedBy: number, editedByName: string, changeNote?: string) {
    // Get current article content
    const [article] = await this.db.select().from(articles).where(eq(articles.id, articleId)).limit(1);
    if (!article) throw new NotFoundException('文章不存在');

    // Get current max version
    const [{ maxVer }] = await this.db.select({ maxVer: max(articleVersions.version) })
      .from(articleVersions).where(eq(articleVersions.articleId, articleId));
    const nextVersion = (maxVer || 0) + 1;

    // Save current state as a version
    const [version] = await this.db.insert(articleVersions).values({
      articleId,
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      version: nextVersion,
      editedBy,
      editedByName,
      changeNote,
    }).returning();

    return { version };
  }

  /**
   * Get version history for an article
   */
  async getVersions(articleId: number) {
    const versions = await this.db.select().from(articleVersions)
      .where(eq(articleVersions.articleId, articleId))
      .orderBy(desc(articleVersions.version));

    return {
      versions: versions.map(v => ({
        ...v,
        createdAt: v.createdAt.toISOString(),
      })),
    };
  }

  /**
   * Get a specific version
   */
  async getVersion(versionId: number) {
    const [version] = await this.db.select().from(articleVersions)
      .where(eq(articleVersions.id, versionId)).limit(1);
    if (!version) throw new NotFoundException('版本不存在');
    return { version: { ...version, createdAt: version.createdAt.toISOString() } };
  }

  /**
   * Restore an article to a specific version
   */
  async restoreVersion(versionId: number, restoredBy: number, restoredByName: string) {
    const [version] = await this.db.select().from(articleVersions)
      .where(eq(articleVersions.id, versionId)).limit(1);
    if (!version) throw new NotFoundException('版本不存在');

    // Save current state as new version before restoring
    await this.saveVersion(version.articleId, restoredBy, restoredByName, `還原至版本 v${version.version}`);

    // Restore the article
    await this.db.update(articles).set({
      title: version.title,
      content: version.content,
      excerpt: version.excerpt,
      updatedAt: new Date(),
    }).where(eq(articles.id, version.articleId));

    return { success: true, restoredToVersion: version.version };
  }
}
