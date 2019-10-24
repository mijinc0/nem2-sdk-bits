import * as nem from 'nem2-sdk';
import { NemConst } from './share/NemConst'
import { Util } from './share/Util'
import { TxUtil } from './share/TxUtil'
import { DefaultOptParse } from './share/DefaultOptParse';

const netType = NemConst.NETWORK_TYPE;

const optParse = new DefaultOptParse();
optParse.subscribePrivateKey();
optParse.subscribe(
  'targetPublickKey',
  (arg: string) => { return (/^--target=[0-9A-Fa-f]{64}$/).test(arg) },
  true,
  (arg: string) => { return arg.slice(9) }
);
optParse.subscribe(
  'scopedMetadataKey',
  (arg: string) => { return (/^--key=\w+$/).test(arg) },
  true,
  (arg: string) => { return arg.slice(9) }
);
optParse.subscribe(
  'value',
  (arg: string) => { return (/^--val=.*$/).test(arg) },
  true,
  (arg: string) => { return arg.slice(6) }
);
optParse.subscribe(
  'sizeDelta',
  (arg: string) => { return (/^--delta=(-|\+)\d+$/).test(arg) },
  true,
  (arg: string) => { return arg.slice(8) }
);
const option = optParse.parse();

const value = option.get('value');
if(value.length > 1024){
  console.error('value size is too long. max length is 1024');
  process.exit(2);
}
const key = nem.KeyGenerator.generateUInt64Key(option.get('scopedMetadataKey'));
const sizeDelta = option.get('sizeDelta'));
const accountMetadataTx = nem.AccountMetadataTransaction.create(
  nem.Deadline.create(),
  option.get('targetPublickKey'),
  key,
  sizeDelta,
  option.get('value'),
  netType
);

const account = nem.Account.createFromPrivateKey(option.get('privateKey'), netType);

// MetadataTxは、対象と成るアカウントに影響を与える権限を、トランザクションの発行者が持っていることを
// 明示するために、AggregateTransactionに包んで送信する必要がある。
// (マルチシグなど、対象となるアカウントのキーペアがつけ変わっている場合がある)
//
// しないと rejected transaction with type: Account_Metadata (top level not supported) として取り下げられる
const aggregateTx = nem.AggregateTransaction.createComplete(
  nem.Deadline.create(),
  [accountMetadataTx.toAggregate(account.publicAccount)],
  netType,
  []
);

TxUtil.sendSinglesigTx(account, aggregateTx, option.get('url'));
