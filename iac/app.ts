/* istanbul ignore file */
import { App } from 'aws-cdk-lib';
import { PersistenceStack } from './stacks/PersistenceStack';
import { getConfig } from './utils/getConfig';
import { ItemsStack } from './stacks/ItemsStack';

const app = new App();
const config = getConfig(app);

const persistenceStack = new PersistenceStack(app, 'PersistenceStack', { stage: config.stage });

new ItemsStack(app, 'ItemsServiceStack', {
  resources: {
    itemsTable: persistenceStack.itemsTable,
  },
  stackName: 'ItemService',
  ...config,
});
