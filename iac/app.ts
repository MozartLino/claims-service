/* istanbul ignore file */
import { App } from 'aws-cdk-lib';
import { PersistenceStack } from './stacks/PersistenceStack';
import { getConfig } from './utils/getConfig';
import { ClaimsStack } from './stacks/ClaimsStack';

const app = new App();
const config = getConfig(app);

const persistenceStack = new PersistenceStack(app, 'ClaimsPersistenceStack', { stage: config.stage });

new ClaimsStack(app, 'ClaimsServiceStack', {
  resources: {
    claimsTable: persistenceStack.claimsTable,
  },
  stackName: 'ClaimsService',
  ...config,
});
