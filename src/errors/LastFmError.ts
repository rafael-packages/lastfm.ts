export class LastFmError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// Error returned specifically by the Last.fm API
export class LastFmApiError extends LastFmError {
  public readonly code: number;

  constructor(code: number, message: string) {
    super(`Last.fm API Error [Code ${code}]: ${message}`);
    this.code = code;
  }
}

// Error representing transport/network layer failure
export class LastFmNetworkError extends LastFmError {
  public readonly status: number;
  public readonly statusText: string;

  constructor(status: number, statusText: string, message?: string) {
    super(message || `Network request failed with status ${status} (${statusText})`);
    this.status = status;
    this.statusText = statusText;
  }
}

// Error representing client-side validation failure
export class LastFmValidationError extends LastFmError {
  constructor(message: string) {
    super(message);
  }
}
