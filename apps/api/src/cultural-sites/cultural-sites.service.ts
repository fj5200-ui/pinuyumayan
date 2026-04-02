import { Injectable } from '@nestjs/common';

export interface CulturalSite { id: number; name: string; type: string; description: string; lat: number; lng: number; tribeId?: number; tribeName?: string; images: string[]; tags: string[]; }

@Injectable()
export class CulturalSitesService {
  private sites: CulturalSite[] = [
    { id: 1, name: '南王部落集會所', type: '集會所', description: '南王部落(Puyuma)的傳統集會所，為部落重要的社會教育場所', lat: 22.7720, lng: 121.1220, tribeId: 1, tribeName: '南王部落', images: [], tags: ['集會所', '文化'] },
    { id: 2, name: '知本溫泉祭祀場', type: '祭祀場', description: '知本部落(Katipul)舉行傳統祭典的神聖場域', lat: 22.6890, lng: 121.0370, tribeId: 2, tribeName: '知本部落', images: [], tags: ['祭祀', '溫泉'] },
    { id: 3, name: '建和少年會所', type: '會所', description: '建和部落(Kasavakan)青年成長訓練的場所，mangayaw大獵祭出發地', lat: 22.7310, lng: 121.0780, tribeId: 3, tribeName: '建和部落', images: [], tags: ['少年會所', '大獵祭'] },
    { id: 4, name: '利嘉林道獵場', type: '獵場', description: '利嘉部落(Likavung)傳統獵場，大獵祭重要場域', lat: 22.7550, lng: 121.0420, tribeId: 4, tribeName: '利嘉部落', images: [], tags: ['獵場', '大獵祭'] },
    { id: 5, name: '初鹿牧場文化區', type: '文化區', description: '初鹿部落(Ulivelivek)附近的文化展示區', lat: 22.7920, lng: 121.0580, tribeId: 5, tribeName: '初鹿部落', images: [], tags: ['牧場', '文化'] },
    { id: 6, name: '卑南遺址', type: '遺址', description: '台灣最重要的史前遺址之一，出土大量卑南文化文物', lat: 22.7840, lng: 121.1180, tribeName: '卑南族共有', images: [], tags: ['遺址', '考古', '史前'] },
    { id: 7, name: '寶桑部落工藝坊', type: '工藝', description: '寶桑部落(Apapulu)的傳統工藝傳習場所', lat: 22.7510, lng: 121.1350, tribeId: 8, tribeName: '寶桑部落', images: [], tags: ['工藝', '編織'] },
    { id: 8, name: '下賓朗祭典廣場', type: '祭典場', description: '下賓朗部落(Pinaski)舉辦聯合年祭的主要場所', lat: 22.7650, lng: 121.1050, tribeId: 7, tribeName: '下賓朗部落', images: [], tags: ['祭典', '年祭'] },
  ];

  async getAll(type?: string) {
    let filtered = this.sites;
    if (type) filtered = filtered.filter(s => s.type === type);
    return { sites: filtered, types: [...new Set(this.sites.map(s => s.type))] };
  }

  async getById(id: number) {
    const site = this.sites.find(s => s.id === id);
    return { site: site || null };
  }

  async getNearby(lat: number, lng: number, radius = 10) {
    const nearby = this.sites.filter(s => {
      const d = Math.sqrt(Math.pow(s.lat - lat, 2) + Math.pow(s.lng - lng, 2)) * 111;
      return d <= radius;
    }).map(s => ({ ...s, distance: Math.round(Math.sqrt(Math.pow(s.lat - lat, 2) + Math.pow(s.lng - lng, 2)) * 111 * 10) / 10 }));
    return { sites: nearby.sort((a, b) => a.distance - b.distance) };
  }
}
