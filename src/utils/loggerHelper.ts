import chalk from "chalk";

interface LogDetails {
  timestamp?: string;
  method?: string;
  url?: string;
  clientId?: string;
  event?: string;
  body?: any;
  query?: any;
  params?: any;
  duration?: number;
  status?: number;
}

export const formatLog = (type: string, message: string, details: LogDetails = {}) => {
  const timestamp = details.timestamp || new Date().toISOString();
  let log = chalk.cyan(`[${timestamp}] `) + chalk.yellow(`${type}: ${message}`);

  // Add optional details
  if (details.clientId) {
    log += chalk.gray(` - Client ID: ${details.clientId}`);
  }

  if (details.event) {
    log += chalk.gray(` - Event: ${details.event}`);
  }

  if (details.duration) {
    log += chalk.gray(` - ${details.duration}ms`);
  }

  // Add request/response details if present
  if (details.body && Object.keys(details.body).length) {
    log += chalk.gray(`\nBody: ${JSON.stringify(details.body, null, 2)}`);
  }

  if (details.query && Object.keys(details.query).length) {
    log += chalk.gray(`\nQuery: ${JSON.stringify(details.query, null, 2)}`);
  }

  if (details.params && Object.keys(details.params).length) {
    log += chalk.gray(`\nParams: ${JSON.stringify(details.params, null, 2)}`);
  }

  return log;
};