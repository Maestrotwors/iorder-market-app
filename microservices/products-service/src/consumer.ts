import { Kafka, logLevel, type Consumer } from 'kafkajs';
import { config } from '../../../config';
import { EventTopics } from '@iorder/shared-contracts';

const kafka = new Kafka({
  clientId: 'products-service-consumer',
  brokers: config.redpanda.brokers,
  logLevel: logLevel.ERROR,
  retry: {
    retries: 5,
    initialRetryTime: 500,
  },
});

let consumer: Consumer | null = null;

export async function initConsumer(): Promise<void> {
  consumer = kafka.consumer({ groupId: 'products-service-consumer' });
  await consumer.connect();

  await consumer.subscribe({
    topics: [EventTopics.PRODUCT_CREATED, EventTopics.PRODUCT_UPDATED, EventTopics.PRODUCT_DELETED],
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const key = message.key?.toString() ?? 'null';
      const offset = message.offset;
      let value: string;

      try {
        const parsed = JSON.parse(message.value?.toString() ?? '{}');
        value = JSON.stringify(parsed, null, 2);
      } catch {
        value = message.value?.toString() ?? 'null';
      }

      console.log(
        `[Consumer] ← ${topic} | partition=${partition} | offset=${offset} | key=${key}\n${value}`,
      );
    },
  });

  console.log('RedPanda consumer connected');
}
