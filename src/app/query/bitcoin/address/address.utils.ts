import { BIT_DECIMALS } from '@shared/constants';
import { BitcoinCryptoCurrencyAssetBalance } from '@shared/models/crypto-asset-balance.model';
import type { Money } from '@shared/models/money.model';
import { isEmptyArray } from '@shared/utils';

import { UtxoResponseItem } from '../bitcoin-client';

export function createBitcoinCryptoCurrencyAssetTypeWrapper(
  balance: Money
): BitcoinCryptoCurrencyAssetBalance {
  return {
    blockchain: 'bitcoin',
    balance,
    asset: {
      decimals: BIT_DECIMALS,
      hasMemo: true,
      name: 'Bitnet IO',
      symbol: 'BIT',
    },
    type: 'crypto-currency',
  };
}

export function hasInscriptions(utxos: UtxoResponseItem[]) {
  return !isEmptyArray(utxos);
}
