import * as nem from 'nem2-sdk';
import { MetadataUtil } from './MetadataUtil'
import { NemConst } from './share/NemConst'
import { Util } from './share/Util'
import { TxUtil } from './share/TxUtil'
import { DefaultOptParse } from './share/DefaultOptParse';

const netType = NemConst.NETWORK_TYPE;

const optParse = new DefaultOptParse();
optParse.subscribePrivateKey();
optParse.subscribe(
  'targetPublickKey',
  (arg: string) => { return (/^--targetKey=[0-9A-Fa-f]{64}$/).test(arg) },
  true,
  (arg: string) => { return arg.slice(12) }
);
optParse.subscribe(
  'targetID',
  (arg: string) => { return (/^--targetID=[0-9A-Fa-f]{16}$/).test(arg) },
  true,
  (arg: string) => { return arg.slice(11) }
);
optParse.subscribe(
  'scopedMetadataKey',
  (arg: string) => { return (/^--key=\w+$/).test(arg) },
  true,
  (arg: string) => { return arg.slice(6) }
);
optParse.subscribe(
  'value',
  (arg: string) => { return (/^--val=.*$/).test(arg) },
  true,
  (arg: string) => { return arg.slice(6) }
);
const option = optParse.parse();
const url = option.get('url');

const getPreviousValue = async (mosaicID: nem.MosaicId, key: string, publicKey: string) => {
  const metadataHttp = new nem.MetadataHttp(url);
  let metadata: nem.Metadata | undefined = undefined;
  try {
    metadata = await metadataHttp.getMosaicMetadataByKeyAndSender(mosaicID, key, publicKey).toPromise();
  } catch (e) {
    console.log('previous data is not found. add new metadata into account.');
  }
  return metadata ? metadata.metadataEntry.value : '';
};

const main = async () => {
  const account = nem.Account.createFromPrivateKey(option.get('privateKey'), netType);
  const key = nem.KeyGenerator.generateUInt64Key(option.get('scopedMetadataKey'));
  const targetPublicKey = option.get('targetPublickKey');
  const targetID : nem.MosaicId = new nem.MosaicId(option.get('targetID'));

  const newValue = option.get('value');
  const previousValue = await getPreviousValue(targetID, key.toHex(), account.publicAccount.publicKey);

  const deltaSet = MetadataUtil.createDeltaSet(newValue, previousValue);
  const valueDelta = deltaSet.value;
  const sizeDelta = deltaSet.size;
  console.table({
    targetID: targetID.toHex(),
    scopedMetadataKey: key.toHex(),
    senderPublicKey: account.publicAccount.publicKey,
    previousValue: previousValue,
    newValue: newValue,
    sizeDelta: sizeDelta.toString()
  });
  const mosaicMetadataTx = nem.MosaicMetadataTransaction.create(
    nem.Deadline.create(),
    targetPublicKey,
    key,
    targetID,
    sizeDelta,
    valueDelta,
    netType
  );
  // MetadataTxは、対象と成るアカウントに影響を与える権限を、トランザクションの発行者が持っていることを
  // 明示するために、AggregateTransactionに包んで送信する必要がある。
  // (マルチシグなど、対象となるアカウントのキーペアがつけ変わっている場合がある)
  //
  // しないと rejected transaction with type: Account_Metadata (top level not supported) として取り下げられる
  const aggregateTx = nem.AggregateTransaction.createComplete(
    nem.Deadline.create(),
    [mosaicMetadataTx.toAggregate(account.publicAccount)],
    netType,
    []
  );
  TxUtil.sendSinglesigTx(account, aggregateTx, url);
};

main();
