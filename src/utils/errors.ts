export class StatusError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export class NotFoundError extends StatusError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class BadRequestError extends StatusError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class UnauthenticatedError extends StatusError {
  constructor(message: string) {
    super(message, 401);
  }
}

export class UnauthorizedError extends StatusError {
  constructor(message: string) {
    super(message, 403);
  }
}
