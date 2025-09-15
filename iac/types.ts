import { StackProps } from 'aws-cdk-lib';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { logLevelSchema, stageSchema } from './utils/getConfig';
import z from 'zod';
import { Construct } from 'constructs';

export type Stage = z.infer<typeof stageSchema>;
export type LogLevel = z.infer<typeof logLevelSchema>;

export interface ConfigStackProps {
  region: string;
  stage: Stage;
  logLevel: LogLevel;
  serviceName: string;
}

export interface ItemsStackProps extends StackProps, ConfigStackProps {
  resources: {
    itemsTable: ITable;
  };
  serviceName: string;
}

export interface PersistenceStackProps extends StackProps {
  stage: Stage;
}

export type CreateFunctionsInput = {
  scope: Construct;
  resources: { itemsTable: ITable };
  config: ConfigStackProps;
};
