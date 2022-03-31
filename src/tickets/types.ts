export interface CreateSearchDocData {
  id: number;
}

export interface UpdateSearchDocData {
  id: number;
  fields: string[];
}

export interface RebuildSearchIndexData {
  startId: number;
  endId?: number;
}
