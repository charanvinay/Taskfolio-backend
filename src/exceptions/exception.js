
export class BaseException extends Error {
  constructor(message, status_code, error_type) {
    super();
  }
  get(res) {
    const { message, error_type } = this;
    res.status(this.status_code).json({ status: false, message, error_type });
  }
}

export class ServerException extends BaseException {
  constructor(message) {
    super(message, 500, "ServerError");
  }
}

export class UnauthorizedException extends BaseException {
  constructor(message) {
    super(message, 401, "Unauthorized");
  }
}

export class ExistsException extends BaseException {
  constructor(message) {
    super(message, 409, "Exists");
  }
}
