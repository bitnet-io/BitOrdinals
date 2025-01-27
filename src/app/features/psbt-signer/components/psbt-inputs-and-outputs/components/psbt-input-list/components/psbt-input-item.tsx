import { createMoney } from '@shared/models/money.model';

import { formatMoney } from '@app/common/money/format-money';
import { Pill } from '@app/components/pill';
import { PsbtInput } from '@app/features/psbt-signer/hooks/use-parsed-inputs';
import { truncateMiddle } from '@app/ui/utils/truncate-middle';

import { PsbtInputOutputItemLayout } from '../../psbt-input-output-item.layout';

const pillHoverLabel = `Value you're approving as contribution to transaction.`;

export function PsbtInputItem({ utxo }: { utxo: PsbtInput }) {
  return (
    <PsbtInputOutputItemLayout
      address={truncateMiddle(utxo.address)}
      addressHoverLabel={utxo.address}
      amount={formatMoney(createMoney(utxo.value, 'BIT'))}
      label={utxo.toSign ? <Pill hoverLabel={pillHoverLabel} label="Approve" /> : undefined}
      txId={truncateMiddle(utxo.txid)}
      txIdHoverLabel={utxo.txid}
    />
  );
}
