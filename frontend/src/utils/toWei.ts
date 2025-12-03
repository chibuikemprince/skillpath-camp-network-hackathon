export const toWei = (amount: string, decimals: number = 18): bigint => {
  const factor = BigInt(10 ** decimals);
  const [whole, fraction = ''] = amount.split('.');
  const wholeBigInt = BigInt(whole) * factor;
  const fractionBigInt = BigInt(fraction.padEnd(decimals, '0').slice(0, decimals));
  return wholeBigInt + fractionBigInt;
};