import { trace } from '@opentelemetry/api';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  traceId?: string;
  spanId?: string;
  [key: string]: unknown;
}

export class Logger {
  constructor(private service: string) {}

  private log(level: LogLevel, message: string, extra?: Record<string, unknown>) {
    const spanContext = trace.getActiveSpan()?.spanContext();

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.service,
      message,
      ...(spanContext && {
        traceId: spanContext.traceId,
        spanId: spanContext.spanId,
      }),
      ...extra,
    };

    const output = JSON.stringify(entry);

    if (level === 'error') {
      console.error(output);
    } else if (level === 'warn') {
      console.warn(output);
    } else {
      console.log(output);
    }
  }

  debug(message: string, extra?: Record<string, unknown>) {
    this.log('debug', message, extra);
  }
  info(message: string, extra?: Record<string, unknown>) {
    this.log('info', message, extra);
  }
  warn(message: string, extra?: Record<string, unknown>) {
    this.log('warn', message, extra);
  }
  error(message: string, extra?: Record<string, unknown>) {
    this.log('error', message, extra);
  }
}

export function createLogger(service: string): Logger {
  return new Logger(service);
}
