import { Injectable, NestMiddleware } from '@nestjs/common';
import * as client from 'prom-client';
import { Request, Response, NextFunction } from 'express';

const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 1, 1.5, 2, 5],
});

const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const end = httpRequestDurationMicroseconds.startTimer();
    res.on('finish', () => {
      end({
        method: req.method,
        route: req.originalUrl,
        status_code: res.statusCode,
      });
      httpRequestCounter.inc({
        method: req.method,
        route: req.originalUrl,
        status_code: res.statusCode,
      });
    });
    next();
  }
}
