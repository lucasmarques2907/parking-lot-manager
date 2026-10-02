import type { Request, Response, NextFunction } from "express";
import { BadRequestError, NotFoundError } from "./errors";
import { respondWithError } from "./json";

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
  }

  if (statusCode >= 500) {
    console.log(err.message);
  }

  respondWithError(res, statusCode, message);
}
