import { Injectable, Inject } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.module';
import { culturalSites } from '../database/schema';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type * as schema from '../database/schema';

@Injectable()
export class CulturalSitesService {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>) {}

  async getAll(type?: string) {
    const rows = type
      ? await this.db.select().from(culturalSites).where(eq(culturalSites.type, type as any))
      : await this.db.select().from(culturalSites);

    const sites = rows.map(s => ({
      ...s,
      images: this.parseJson(s.images, []),
      tags: this.parseJson(s.tags, []),
    }));

    const types = [...new Set(rows.map(s => s.type))];
    return { sites, types };
  }

  async getById(id: number) {
    const [site] = await this.db.select().from(culturalSites).where(eq(culturalSites.id, id)).limit(1);
    if (!site) return null;
    return {
      ...site,
      images: this.parseJson(site.images, []),
      tags: this.parseJson(site.tags, []),
    };
  }

  async getNearby(lat: number, lng: number, radius: number) {
    // Haversine formula in SQL for distance in km
    const allSites = await this.db.select().from(culturalSites);
    const nearby = allSites
      .filter(s => s.latitude && s.longitude)
      .map(s => {
        const d = this.haversine(lat, lng, s.latitude!, s.longitude!);
        return { ...s, distance: Math.round(d * 10) / 10, images: this.parseJson(s.images, []), tags: this.parseJson(s.tags, []) };
      })
      .filter(s => s.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
    return { sites: nearby };
  }

  private haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private parseJson(val: string | null, fallback: any) {
    if (!val) return fallback;
    try { return JSON.parse(val); } catch { return fallback; }
  }
}
