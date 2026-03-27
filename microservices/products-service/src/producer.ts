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
    const value = JSON.stringify(payload);
    await producer.send({
      topic,
      messages: [
        {
          key,
          value,
          timestamp: Date.now().toString(),
        },
      ],
    });
    console.log(`[Producer] → ${topic} | key=${key} | payload=${value}`);
  } catch (error) {
    console.error(`[Producer] Failed to publish to ${topic}:`, error);
  }
}

async function disconnectProducer(): Promise<void> {
  if (producer) {
    await producer.disconnect();
    producer = null;
  }
}
