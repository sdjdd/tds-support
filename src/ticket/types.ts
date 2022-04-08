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

export interface FindTicketsOptions {
  requesterId?: number;
  assigneeId?: number;
  page?: number;
  pageSize?: number;
  orderBy?: ['seq' | 'status' | 'createdAt', 'ASC' | 'DESC'];
}
