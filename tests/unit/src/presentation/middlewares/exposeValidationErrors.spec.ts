import createHttpError from 'http-errors';
import createLambdaContext from '../../../../fixtures/createLambdaContext';
import createLambdaEvent from '../../../../fixtures/createLambdaEvent';
import exposeValidationErrors from '../../../../../src/presentation/middlewares/exposeValidationErrors';
import { mockLogger } from '../../../../fixtures/mocks';

describe('getOffer', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const lambdaContext = createLambdaContext();
  const event = createLambdaEvent();

  const validationErrors = [
    {
      instancePath: '/queryStringParameters',
      schemaPath: '#/properties/queryStringParameters/required',
      keyword: 'required',
      params: { missingProperty: 'postcode' },
      message: "must have required property 'postcode'",
    },
    {
      instancePath: '/queryStringParameters',
      schemaPath: '#/properties/queryStringParameters/required',
      keyword: 'required',
      params: { missingProperty: 'quoteId' },
      message: "must have required property 'quoteId'",
    },
  ];

  it('should expose the cause of a validation error as an application/json response', async () => {
    const middleware = exposeValidationErrors(mockLogger);

    if (!middleware.onError) {
      fail('onError does not exist');
    }

    const handler = {
      response: { statusCode: 400, body: 'Event object failed validation', headers: { 'Content-Type': 'text/plain' } },
      event,
      context: lambdaContext,
      error: createHttpError(400, { message: 'Event object failed validation', cause: validationErrors }),
      internal: {},
    };

    middleware.onError(handler);

    expect(handler.response).toStrictEqual({
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Event object failed validation', validationErrors }),
    });
  });

  it('should create and set content-Type if not present on the response', async () => {
    const middleware = exposeValidationErrors(mockLogger);

    if (!middleware.onError) {
      fail('onError does not exist');
    }

    const handler = {
      response: { statusCode: 400, body: 'Event object failed validation' },
      event,
      context: lambdaContext,
      error: createHttpError(400, { message: 'Event object failed validation', cause: validationErrors }),
      internal: {},
    };

    middleware.onError(handler);

    expect(handler.response).toStrictEqual({
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Event object failed validation', validationErrors }),
    });
  });

  it('should not modify the handler if there is no error with a cause attached to it', async () => {
    const middleware = exposeValidationErrors(mockLogger);

    if (!middleware.onError) {
      fail('onError does not exist');
    }

    const handler = {
      response: { statusCode: 400, body: 'Event object failed validation', headers: { 'Content-Type': 'text/plain' } },
      event,
      context: lambdaContext,
      error: createHttpError(400, { message: 'Event object failed validation' }),
      internal: {},
    };

    middleware.onError(handler);

    expect(handler).toStrictEqual(handler);
  });

  it('should not modify the handler if there is no error attached', async () => {
    const middleware = exposeValidationErrors(mockLogger);

    if (!middleware.onError) {
      fail('onError does not exist');
    }

    const handler = {
      response: { statusCode: 400, body: 'Event object failed validation', headers: { 'Content-Type': 'text/plain' } },
      event,
      context: lambdaContext,
      error: null,
      internal: {},
    };

    middleware.onError(handler);

    expect(handler).toStrictEqual(handler);
  });
});
