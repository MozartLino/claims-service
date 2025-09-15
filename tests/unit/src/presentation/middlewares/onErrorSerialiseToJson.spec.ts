import createHttpError from 'http-errors';
import onErrorSerialiseToJson from '../../../../../src/presentation/middlewares/onErrorSerialiseToJson';
import createLambdaContext from '../../../../fixtures/createLambdaContext';
import createLambdaEvent from '../../../../fixtures/createLambdaEvent';

describe('onErrorSerialiseToJson', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const lambdaContext = createLambdaContext();
  const event = createLambdaEvent();

  it('should convert a text/plain response to an application/json response', async () => {
    const middleware = onErrorSerialiseToJson();

    if (!middleware.onError) {
      fail('onError does not exist');
    }

    const handler = {
      response: { statusCode: 500, body: 'An unexpected error occurred', headers: { 'Content-Type': 'text/plain' } },
      event,
      context: lambdaContext,
      error: null,
      internal: {},
    };

    middleware.onError(handler);

    expect(handler.response).toStrictEqual({
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'An unexpected error occurred' }),
    });
  });

  it('should do do nothing if the content-type is not text/plain', async () => {
    const middleware = onErrorSerialiseToJson();

    if (!middleware.onError) {
      fail('onError does not exist');
    }

    const handler = {
      response: {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'An unexpected error occurred' }),
      },
      event,
      context: lambdaContext,
      error: null,
      internal: {},
    };

    middleware.onError(handler);

    expect(handler).toStrictEqual(handler);
  });

  it('should do do nothing if headers is undefined', async () => {
    const middleware = onErrorSerialiseToJson();

    if (!middleware.onError) {
      fail('onError does not exist');
    }

    const handler = {
      response: { statusCode: 500, body: JSON.stringify({ message: 'An unexpected error occurred' }) },
      event,
      context: lambdaContext,
      error: null,
      internal: {},
    };

    middleware.onError(handler);

    expect(handler).toStrictEqual(handler);
  });

  it('should do do nothing if response is null', async () => {
    const middleware = onErrorSerialiseToJson();

    if (!middleware.onError) {
      fail('onError does not exist');
    }

    const handler = {
      response: null,
      event,
      context: lambdaContext,
      error: null,
      internal: {},
    };

    middleware.onError(handler);

    expect(handler).toStrictEqual(handler);
  });

  it('should return only message if httpError', () => {
    const middleware = onErrorSerialiseToJson();
    if (!middleware.onError) {
      fail('onError does not exist');
    }

    const handler = {
      response: { statusCode: 500, body: 'Only message', headers: { 'Content-Type': 'text/plain' } },
      event,
      context: lambdaContext,
      error: createHttpError.InternalServerError('Only message'),
      internal: {},
    };

    middleware.onError(handler);

    expect(handler.response).toStrictEqual({
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Only message' }),
    });
  });
});
