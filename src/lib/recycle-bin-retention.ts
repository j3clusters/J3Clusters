/** Days items stay in the operations recycle bin before automatic permanent removal. */
export const RECYCLE_BIN_RETENTION_DAYS = 30;

export function recycleBinCutoffDate(): Date {
  return new Date(
    Date.now() - RECYCLE_BIN_RETENTION_DAYS * 24 * 60 * 60 * 1000,
  );
}
