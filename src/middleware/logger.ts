import morgan, { StreamOptions } from 'morgan';
import logger from '../utils/logger';

// Stream object for Morgan to use our Winston logger
const stream: StreamOptions = {
  write: (message: string) => logger.http(message.trim()),
};

// Skip logging only for health check endpoint
const skip = (req: any) => {
  // Skip health check to reduce noise
  return req.url === '/health';
};

// Build the morgan middleware
const morganMiddleware = morgan(
  // Define message format string (this is the default one)
  // :remote-addr :method :url :status :res[content-length] - :response-time ms
  ':remote-addr :method :url :status :res[content-length] - :response-time ms',
  // Options: stream and skip
  { stream, skip }
);

export default morganMiddleware;
