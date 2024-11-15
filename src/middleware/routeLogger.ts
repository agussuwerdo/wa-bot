import { Request, Response, NextFunction } from "express";
import chalk from "chalk";
import { formatLog } from "../utils/loggerHelper";

export const routeLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  // Log request details
  console.log(formatLog("HTTP", `${req.method} ${req.url}`, {
    timestamp,
    body: req.body,
    query: req.query,
    params: req.params
  }));

  // Capture the original res.json to intercept the response
  const originalJson = res.json;
  res.json = function(body) {
    res.locals.body = body; // Store the response body
    return originalJson.call(this, body);
  };

  // Once the response is finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(formatLog("HTTP", `${req.method} ${req.url}`, {
      timestamp,
      duration,
      status: res.statusCode,
      body: res.locals.body
    }));

    console.log(chalk.gray('─'.repeat(80)));
  });

  next();
};