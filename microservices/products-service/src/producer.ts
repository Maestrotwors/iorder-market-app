import { Kafka, logLevel, type Producer } from 'kafkajs';
import { config } from '../../../config';

const kafka = new Kafka({
  clientId: 'products-service',
  brokers: config.redpanda.brokers,
  logLevel: logLevel.NOTHING,
  retry: {
    retries: 1,
    initialRetryTime: 200,
  },
});

let producer: Producer | null = null;

export async function initProducer(): Promise<void> {
  producer = kafka.producer();
  await producer.connect();
  console.log('RedPanda producer connected');
}

export async function publishEvent(
  topic: string,
  key: string,
  payload: Record<string, unknown>,
): Promise<void> {
  if (!producer) {
    console.warn('Producer not connected, skipping event:', topic);
    return;
  }

  try {
    await producer.send({
      topic,
      messages: [
        {
          key,
          value: JSON.stringify(payload),
          timestamp: Date.now().toString(),
        },
      ],
    });
  } catch (error) {
    console.error(`Failed to publish event to ${topic}:`, error);
  }
}

async function disconnectProducer(): Promise<void> {
  if (producer) {
    await producer.disconnect();
    producer = null;
  }
}
