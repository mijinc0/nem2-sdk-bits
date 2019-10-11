import * as nem from 'nem2-sdk';
import { NemConst } from './share/NemConst'
import { Util } from './share/Util'
import { TxUtil } from './share/TxUtil'
import { DefaultOptParse } from './share/DefaultOptParse';

const netType = nem.NetworkType.MIJIN_TEST;

const optParse = new DefaultOptParse();
optParse.subscribePrivateKey();
// <publicKey>:<publicKey>:<publicKey>...
optParse.subscribe(
  'cosignatoryPrivateKeys',
  (arg: string) => { return (/^-c[0-9A-Fa-f]{64}(:[0-9A-Fa-f]{64})*$/).test(arg) },
  true,
  (arg: string) => { return arg.slice(2) }
);
optParse.subscribe(
  'minApprovalDelta',
  (arg: string) => { return (/^-a(-|\+)\d+$/).test(arg) },
  true,
  (arg: string) => { return arg.slice(2) }
);
optParse.subscribe(
  'minRemovalDelta',
  (arg: string) => { return (/^-r(-|\+)\d+$/).test(arg) },
  true,
  (arg: string) => { return arg.slice(2) }
);
const option = optParse.parse();

const cosignatories = option.get('cosignatoryPrivateKeys').split(':').map(key => {
  return nem.Account.createFromPrivateKey(key, netType);
});

const modifications = cosignatories.map(account => {
  return new nem.MultisigCosignatoryModification(nem.CosignatoryModificationAction.Add, account.publicAccount);
});

const multisigAccountModificationTx = nem.MultisigAccountModificationTransaction.create(
  nem.Deadline.create(),
  parseInt(option.get('minApprovalDelta')),
  parseInt(option.get('minRemovalDelta')),
  modifications,
  netType
);

const modifiedAccount = nem.Account.createFromPrivateKey(option.get('privateKey'), netType);

console.log(`account : ${modifiedAccount.address.plain()}`);
console.log(`minApprovalDelta : ${option.get('minApprovalDelta')}`);
console.log(`minRemovalDelta  : ${option.get('minRemovalDelta')}`);
console.log(`cosignatories : (${cosignatories.length})`);
cosignatories.forEach(cosignatory => {
  console.log(`    ${cosignatory.publicKey}`);
});

TxUtil.sendAggreagateCompleteTx(
  cosignatories.concat([modifiedAccount]),
  [multisigAccountModificationTx.toAggregate(modifiedAccount.publicAccount)],
  option.get('url')
);
