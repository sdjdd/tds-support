import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('sync-to-es')
export class SyncProcessor {
  @Process('ticket')
  async syncTicket(job: Job<{ id: string }>) {
    // TODO
    console.log('sync ticket to es, ticket id:', job.data.id);
  }
}
