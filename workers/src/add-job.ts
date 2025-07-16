import { Queue } from 'bullmq';

/**
 * Example usage:
 * tsc src/add-job.ts 5
 */

const exampleJobs: Record<number, { queue: string; data: any }> = {
  1: { queue: 'nodes', data: { chainId: 'polkadot' } },
  2: { queue: 'nodes', data: { chainId: 'kusama' } },
  3: { queue: 'prune-db', data: { chainId: 'polkadot' } },
  4: { queue: 'prune-db', data: { chainId: 'kusama' } },
  5: { queue: 'validators', data: { chainId: 'polkadot' } },
  6: { queue: 'validators', data: { chainId: 'kusama' } },
  7: { queue: 'nominators', data: { chainId: 'polkadot' } },
  8: { queue: 'nominators', data: { chainId: 'kusama' } },
  9: { queue: 'index-blocks', data: { chainId: 'polkadot' } },
  10: { queue: 'index-blocks', data: { chainId: 'kusama' } },
  11: { queue: 'exposure-histories', data: { chainId: 'polkadot' } },
  12: { queue: 'exposure-histories', data: { chainId: 'kusama' } },
  13: { queue: 'aggregation', data: { chainId: 'polkadot' } },
  14: { queue: 'aggregation', data: { chainId: 'kusama' } },
};

const printAvailableJobs = () => {
  console.error('Available jobs:');
  let i = 1;
  for (const job of Object.values(exampleJobs)) {
    console.error(`${i}: ${job.queue}, ${job.data.chainId}`);
    i++;
  }
};

;(async () => {
  // read the job number from the command line
  const jobNumber = process.argv[2];
  if (!jobNumber) {
    console.error('Job number is required');
    printAvailableJobs();
    process.exit(1);
  }
  if (!exampleJobs[parseInt(jobNumber)]) {
    console.error('Invalid job number');
    printAvailableJobs();
    process.exit(1);
  }
  const job = exampleJobs[parseInt(jobNumber)];

  const queue = new Queue(job.queue, {
    connection: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
  });

  await queue.add(job.data.chainId, job.data);
  console.log(`Job ${job.queue}, ${job.data.chainId} added`);
  process.exit(0);

})();
