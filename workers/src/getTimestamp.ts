import { ApiPromise, WsProvider } from '@polkadot/api';
import { IEra } from './globals';
import { getBlockTimestamp, IBlock } from './chainUtils';
import { SignedBlock } from '@polkadot/types/interfaces';
import moment from 'moment';

(async () => {
  const provider = new WsProvider(`wss://rpc.metaspan.io/kusama`);
  const api = await ApiPromise.create({ provider, noInitWarn: true });
  await api.isReady;

  const latestHash = await api.rpc.chain.getBlockHash();
  const latestBlock = await api.rpc.chain.getBlock(latestHash);
  const latestNumber = latestBlock.block.header.number.toNumber();
  const latestTimestamp = await getBlockTimestamp(api, latestHash.toString());
  const latestHour = moment(latestTimestamp).format('YYYY-MM-DD-HH');

 // Let's search in a window of 600 blocks (approx. 1 hour)
 let low = latestNumber - 600;
 let high = latestNumber;
 let resultBlockNumber = latestNumber;

 while (low <= high) {
   const mid = Math.floor((low + high) / 2);
   const midHash = await api.rpc.chain.getBlockHash(mid);
   const midTimestamp = await getBlockTimestamp(api, midHash.toString());
   const midHour = moment(midTimestamp).format('YYYY-MM-DD-HH');

   if (midHour < latestHour) {
     resultBlockNumber = mid;
     low = mid + 1; // look for later blocks in previous hour
   } else {
     high = mid - 1; // look earlier
   }
 }

 const resultHash = await api.rpc.chain.getBlockHash(resultBlockNumber);
 const resultTimestamp = await getBlockTimestamp(api, resultHash.toString());
 const formatted = moment(resultTimestamp).format('YYYY-MM-DD HH:mm:ss');

 console.log(`✅ Found block in previous hour:`);
 console.log(`Block #: ${resultBlockNumber}`);
 console.log(`Timestamp: ${formatted}`);

 await api.disconnect();
  process.exit(0);
})();

