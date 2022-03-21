import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';

@Injectable()
export class SequenceService {
  constructor(private connection: Connection) {}

  async getNextId(organizationId: number, table: string): Promise<number> {
    const nextId = await this.tryToGetNextId(organizationId, table);
    if (nextId) {
      return nextId;
    }
    return this.generateSequence(organizationId, table);
  }

  private async tryToGetNextId(organizationId: number, table: string) {
    let nextId: number | undefined;
    await this.connection.transaction(async (manager) => {
      const [row] = await manager.query(
        'SELECT next_id from sequence where organization_id = ? AND name = ? LIMIT 1 FOR UPDATE',
        [organizationId, table],
      );
      if (row) {
        nextId = row.next_id;
        await manager.query(
          'UPDATE sequence SET next_id = next_id + 1 WHERE organization_id = ? AND name = ?',
          [organizationId, table],
        );
      }
    });
    return nextId;
  }

  private async generateSequence(organizationId: number, table: string) {
    const lockName = `tds_support_sequence:org${organizationId}:${table}`;
    const [result] = await this.connection.query(
      'SELECT GET_LOCK(?,10) as ok;',
      [lockName],
    );
    if (result.ok === 0) {
      throw new Error('generate sequence timeout');
    }
    if (result.ok === null) {
      throw new Error('generate sequence failed');
    }
    try {
      const [row] = await this.connection.query(
        'SELECT next_id from sequence where organization_id = ? AND name = ? LIMIT 1',
        [organizationId, table],
      );
      if (row) {
        return row.next_id;
      }
      await this.connection.query(
        'INSERT INTO sequence (organization_id,name,next_id) VALUES(?,?,?)',
        [organizationId, table, 2],
      );
      return 1;
    } finally {
      await this.connection.query('SELECT RELEASE_LOCK(?);', [lockName]);
    }
  }
}
