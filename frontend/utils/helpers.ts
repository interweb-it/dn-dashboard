
// utils/helpers.ts

export function shortStash(stash: string) {
  if (!stash || stash.length <= 12) return stash;
  return `${stash.slice(0, 6)}…${stash.slice(-6)}`;
}

export function handleScroll(callback: (scrollY: number) => void) {
  const onScroll = () => {
    const scrollY = window.scrollY;
    callback(scrollY);
  };

  window.addEventListener("scroll", onScroll);

  return () => {
    // Cleanup function to remove the event listener
    window.removeEventListener("scroll", onScroll);
  };
}

// export async function getAllNominators (api: any, nominatorStore: any) {
//   // loadingN.value = true
//   console.debug('getAllNominators');
//   if (!api) return
//   // nominators.value = []
//   const stakingEntries = await api.query.staking.nominators.entries()
//   // console.debug('stakingEntries', stakingEntries)
//   for (const [key, nominations] of stakingEntries) {
//     const nominatorAddress = key.args[0].toString();
//     const targets = nominations.toJSON() as any;
//     const accountData = (await api.query.system.account(nominatorAddress)).toJSON() as any;
//     // console.debug('accountData', accountData)
//     const balance = Number(BigInt(accountData.data.free)); // Available balance
//     nominatorStore.addNominator({ address: nominatorAddress, balance: balance, targets: targets.targets });
//   }
//   console.debug('nominators', nominatorStore.nominators.size)
//   // loadingN.value = false
// }
