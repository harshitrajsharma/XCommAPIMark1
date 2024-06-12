import { ApiError } from "../utils/ApiError.js";

export const errorHandling = (err, req, res, next) => {
    if (err instanceof ApiError) {
      // If the error is an ApiError, use the status and message from the error
      res.status(err.statusCode).json({ errror: err.error, errors: err.errors, success: err.success });
    } else {
      // If the error is not an ApiError, send a generic 500 error
      res.status(500).json({ "error": 'An unexpected error occurred' });
    }
}