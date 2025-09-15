/* istanbul ignore file */
import createHttpError from 'http-errors';

type Info = {
  reason?: string;
  cause?: unknown;
  response?: unknown;
  additionalClientInfo?: unknown;
  [key: string]: unknown;
};

export const notFound = (info?: Info) => createHttpError(404, 'Resource not found', { expose: true, ...info });
export const badRequest = (info?: Info) => createHttpError(400, 'Request is invalid', { expose: true, ...info });
export const internalError = (info?: Info) => createHttpError(500, 'Internal server error', { expose: true, ...info });
export const unauthorizedRecaptcha = (info?: Info) => createHttpError(401, 'Unauthorized: Recaptcha failed', { expose: true, ...info });
export const forbidden = (info?: Info) => createHttpError(403, 'Forbidden', { expose: true, ...info });
export const conflict = (info?: Info) => createHttpError(409, 'Conflict', { expose: true, ...info });
export const unprocessableEntity = (info?: Info) => createHttpError(422, 'Unprocessable Entity', { expose: true, ...info });
export const serviceUnavailable = (info?: Info) => createHttpError(503, 'Service Unavailable', { expose: true, ...info });
