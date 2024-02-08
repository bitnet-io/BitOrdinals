import { useEffect } from 'react';

import { useAnalytics } from '@app/common/hooks/analytics/use-analytics';
import { useStampsByAddressQuery } from '@app/query/bitcoin/stamps/stamps-by-address.query';
import { useCurrentAccountNativeSegwitAddressIndexZero } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';

import { Stamp } from './stamp';

export function Stamps() {
  const currentAccountBtcAddress = useCurrentAccountNativeSegwitAddressIndexZero();
//  const { data: stamps = [] } = useStampsByAddressQuery(currentAccountBtcAddress);
  const analytics = useAnalytics();

	return;
}
