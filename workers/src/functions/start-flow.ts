import { Job, FlowProducer } from 'bullmq';

import { Logger } from '../utils';

export const startFlow = async (job: Job) => {
  const { chainId } = job.data;
  const logger = new Logger(job);

  logger.log(`Starting flow for ${chainId}`);

  const qOpts = {
    connection: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
  };

  const flow = new FlowProducer(qOpts);
  await flow.add({
    name: `${chainId}-flow`,
    queueName: 'index-blocks',
    data: { chainId },
    children: [
      {
        queueName: 'nodes',
        name: 'nodes',
        data: { chainId },
      },
      {
        queueName: 'index-blocks',
        name: 'index-blocks',
        data: { chainId },
        children: [
          {
            queueName: 'validators',
            name: 'validators',
            data: { chainId },
            children: [
              {
                queueName: 'nominators',
                name: 'nominators',
                data: { chainId },
                children: [
                  {
                    queueName: 'aggregation',
                    name: 'aggregation',
                    data: { chainId },
                  },
                  // {
                  //   queueName: 'exposure-history',
                  //   name: 'exposure-history',
                  //   data: { chainId },
                  //   children: [
                  //   ],
                  // },
                ],
              },
            ],
          },
        ]
      },
    ],
  });
};