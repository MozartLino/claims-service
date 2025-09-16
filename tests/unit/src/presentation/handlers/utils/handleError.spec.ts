import { InfraError } from '../../../../../../src/domain';
import { handleError } from '../../../../../../src/presentation/handlers/http/utils/handleError';
import * as mapper from '../../../../../../src/presentation/handlers/http/utils/mapDomainErrorToHttpError';
import * as responseError from '../../../../../../src/presentation/utils/errors/responseError';

describe('handleError', () => {
  it('should throw mapped HTTP error when error is a DomainError', () => {
    const domainErr = new InfraError('error');
    const mappedError = new Error('mapped!');

    const spy = jest.spyOn(mapper, 'mapDomainErrorToHttpError').mockReturnValue(mappedError);

    expect(() => handleError(domainErr)).toThrow(mappedError);
    expect(spy).toHaveBeenCalledWith(domainErr);
  });

  it('should throw internal error when error is not DomainError', () => {
    const genericErr = new Error('something went wrong');
    const internalErr = responseError.internalError({ reason: 'Internal Server Error' });

    const spy = jest.spyOn(responseError, 'internalError').mockReturnValue(internalErr);

    expect(() => handleError(genericErr)).toThrow(internalErr);
    expect(spy).toHaveBeenCalledWith({ reason: 'Internal Server Error' });
  });

  it('should pass custom reason to internalError if provided', () => {
    const err = new Error('boom');
    const internalErr = responseError.internalError({ reason: 'Internal Server Error' });

    const spy = jest.spyOn(responseError, 'internalError').mockReturnValue(internalErr);

    expect(() => handleError(err, 'Custom Reason')).toThrow(internalErr);
    expect(spy).toHaveBeenCalledWith({ reason: 'Custom Reason' });
  });
});
