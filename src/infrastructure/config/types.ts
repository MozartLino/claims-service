import { z } from 'zod';

export const stageSchema = z.enum(['prod', 'dev', 'stg']);

export type Stage = z.infer<typeof stageSchema>;

export type Config = {
  region: string;
  logLevel: string;
  stage: Stage;
  serviceName: string;
  itemsTableName: string;
};
