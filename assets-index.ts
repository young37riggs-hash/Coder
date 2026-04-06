export interface AssetManifest {
  id: string;
  name: string;
  type: 'image' | 'audio' | 'video' | 'document' | 'other';
  path: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  thumbnail?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class AssetManager {
  private assets = new Map<string, AssetManifest>();

  register(asset: AssetManifest): void {
    this.assets.set(asset.id, asset);
  }

  get(id: string): AssetManifest | undefined {
    return this.assets.get(id);
  }

  getAll(): AssetManifest[] {
    return Array.from(this.assets.values());
  }

  getByType(type: AssetManifest['type']): AssetManifest[] {
    return Array.from(this.assets.values()).filter(a => a.type === type);
  }

  search(query: string): AssetManifest[] {
    const lower = query.toLowerCase();
    return Array.from(this.assets.values()).filter(
      a => a.name.toLowerCase().includes(lower) || a.tags?.some(t => t.toLowerCase().includes(lower))
    );
  }

  remove(id: string): boolean {
    return this.assets.delete(id);
  }
}
