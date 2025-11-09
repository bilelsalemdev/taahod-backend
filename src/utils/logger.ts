import winston from 'winston';
import fs from 'fs';
import path from 'path';
import config from '../config';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston about our colors
winston.addColors(colors);

// Console format (with colors for terminal)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// File format (no colors)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  try {
    fs.mkdirSync(logsDir, { recursive: true });
  } catch (error) {
    console.error('Failed to create logs directory:', error);
  }
}

// Define which transports the logger must use
const transports: winston.transport[] = [
  // Console transport (always enabled)
  new winston.transports.Console({
    format: consoleFormat,
  }),
];

// Add file transports only if logs directory is writable
try {
  if (fs.existsSync(logsDir)) {
    transports.push(
      new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
        format: fileFormat,
      }),
      new winston.transports.File({
        filename: path.join(logsDir, 'all.log'),
        format: fileFormat,
      })
    );
  }
} catch (error) {
  console.error('Failed to add file transports:', error);
}

// Create the logger
const logger = winston.createLogger({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  levels,
  transports,
});

export default logger;
