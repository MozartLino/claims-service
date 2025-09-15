/* istanbul ignore file */
const json = (code: number, body: unknown) => ({
  statusCode: code,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
});

export const ok = (d: unknown) => json(200, d);
export const created = (d: unknown) => json(201, d);
export const noContent = () => ({ statusCode: 204, headers: {}, body: '' });
