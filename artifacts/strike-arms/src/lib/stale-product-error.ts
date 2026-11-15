/**
 * Somebody (or something: a sale, a checkout hold) saved this product after
 * the form loaded it (M-032). Carries the row's current updated_at, so the
 * form can take the fresh version and let the admin save again on purpose.
 */
export class StaleProductError extends Error {
  readonly currentUpdatedAt: string;

  constructor(currentUpdatedAt: string) {
    super(
      'This product was saved by something else after you opened it, such as an order or a stock change. ' +
        'It has been refreshed. Check your changes and click Update again.',
    );
    this.name = 'StaleProductError';
    this.currentUpdatedAt = currentUpdatedAt;
  }
}
