export interface PlatformMaterial {
  textureKey: string;
  topTint: number;
  sideTint: number;
  edgeTint: number;
}

export const platformMaterials: Record<string, PlatformMaterial> = {
  tile_stone: {
    textureKey: 'tileset_bridge',
    topTint: 0xffffff,
    sideTint: 0x9ea5a1,
    edgeTint: 0xd4d9cf
  },
  tile_wood: {
    textureKey: 'tileset_huizhou',
    topTint: 0xffffff,
    sideTint: 0x72502d,
    edgeTint: 0xd7ad73
  },
  tile_brick: {
    textureKey: 'tileset_yamen',
    topTint: 0xffffff,
    sideTint: 0x4f6070,
    edgeTint: 0xb76b5f
  },
  tile_palace: {
    textureKey: 'tileset_taihe',
    topTint: 0xffffff,
    sideTint: 0xd8c9a2,
    edgeTint: 0xf0c44f
  }
};

export function materialForTile(tileKey: string): PlatformMaterial {
  return platformMaterials[tileKey] ?? platformMaterials.tile_stone;
}
