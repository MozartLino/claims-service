/* istanbul ignore file */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, TranslateConfig } from '@aws-sdk/lib-dynamodb';
import { Config } from '../../config/types';

const translateConfig: TranslateConfig = {
  marshallOptions: {
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
};

export const createClient = (config: Config): DynamoDBDocumentClient => {
  const baseClient = new DynamoDBClient({ region: config.region });
  return DynamoDBDocumentClient.from(baseClient, translateConfig);
};
