import type { Request, Response, NextFunction } from "express";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnprocessableEntityError,
} from "./errors.js";
import { respondWithError } from "./json.js";
import rateLimit from "express-rate-limit";

export const LIMITER = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  ipv6Subnet: 56,
  message: {
    error: "Muitas requisições. Por favor, aguarde e tente novamente.",
  },
});

export function middlewareLogResponse(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  res.on("finish", () => {
    const statusCode = res.statusCode;

    if (statusCode >= 300) {
      console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
    }
  });

  next();
}

export function errorMiddleware(
  err: Error,
  _: Request,
  res: Response,
  __: NextFunction,
) {
  let statusCode = 500;
  let message = "Algo deu errado";

  if (err instanceof BadRequestError) {
    statusCode = 400;
    message = err.message;
  } else if (err instanceof NotFoundError) {
    statusCode = 404;
    message = err.message;
  } else if (err instanceof ConflictError) {
    statusCode = 409;
    message = err.message;
  } else if (err instanceof UnprocessableEntityError) {
    statusCode = 422;
    message = err.message;
  }

  if (statusCode >= 500) {
    console.log(err.message);
  }

  respondWithError(res, statusCode, message);
}
