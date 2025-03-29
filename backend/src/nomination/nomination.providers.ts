import { Nomination } from './nomination.entity';

export const nominationProviders = [
  {
    provide: 'NOMINATION_REPOSITORY',
    useValue: Nomination,
  },
];
