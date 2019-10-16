import * as nem from 'nem2-sdk';
import { NemConst } from './share/NemConst'
import { Util } from './share/Util'
import { TxUtil } from './share/TxUtil'
import { DefaultOptParse } from './share/DefaultOptParse';

const netType = nem.NetworkType.MIJIN_TEST;

const optParse = new DefaultOptParse();
optParse.subscribePrivateKey();
optParse.subscribe(
  'targetMosaicId',
  (arg: string) => { return (/^--target=[0-9A-Fa-f]{16}$/).test(arg) },
  true,
  (arg: string) => { return arg.slice(9) }
);
const types = ['EQ', 'GE', 'GT', 'LE', 'LT', 'NE', 'NONE'];
optParse.subscribe(
  'previousRestriction',
  (arg: string) => { return (/^--prev=[A-Z]+:\d+$/).test(arg) && types.includes(arg.slice(7).split(':')[0]) },
  true,
  (arg: string) => { return arg.slice(7) }
);
optParse.subscribe(
  'newRestriction',
  (arg: string) => { return (/^--new=[A-Z]+:\d+$/).test(arg) && types.includes(arg.slice(6).split(':')[0]) },
  true,
  (arg: string) => { return arg.slice(6) }
);
optParse.subscribe(
  'restrictionKey',
  (arg: string) => { return (/^--key=[0-9A-Fa-f]{16}$/).test(arg) },
  true,
  (arg: string) => { return arg.slice(6) }
);
optParse.subscribe(
  'referenceMosaicId',
  (arg: string) => { return (/^--refer=[0-9A-Fa-f]{16}$/).test(arg) },
  false,
  (arg: string) => { return arg.slice(8) },
);
const option = optParse.parse();

const mosaicId = new nem.MosaicId(option.get('targetMosaicId'));
const referenceMosaicId = option.get('referenceMosaicId') ? new nem.MosaicId(option.get('referenceMosaicId')) : undefined;
const restrictionKey = nem.UInt64.fromHex(option.get('restrictionKey'));

const previousRestriction = option.get('previousRestriction').split(':');
const previousRestrictionValue = nem.UInt64.fromUint(parseInt(previousRestriction[1]));
const previousRestrictionType = (<any>nem.MosaicRestrictionType)[previousRestriction[0]];

const newRestriction = option.get('newRestriction').split(':');
const newRestrictionValue = nem.UInt64.fromUint(parseInt(newRestriction[1]));
const newRestrictionType = (<any>nem.MosaicRestrictionType)[newRestriction[0]];

console.table({
  mosaicId: mosaicId.toHex(),
  restrictionKey: restrictionKey.toHex(),
  prevType: previousRestriction[0],
  prevValue: previousRestriction[1],
  newType: newRestriction[0],
  newValue: newRestriction[1],
  referMosaicID: referenceMosaicId ? referenceMosaicId.toHex() : 'undefined',
});

const mosaicGlobalRestrictionTx = nem.MosaicGlobalRestrictionTransaction.create(
  nem.Deadline.create(),
  mosaicId,
  restrictionKey,
  previousRestrictionValue,
  previousRestrictionType,
  newRestrictionValue,
  newRestrictionType,
  netType,
  referenceMosaicId,
);

const privateKey = option.get('privateKey');
const mosaicIssuer = nem.Account.createFromPrivateKey(privateKey, netType);
TxUtil.sendSinglesigTx(mosaicIssuer, mosaicGlobalRestrictionTx, option.get('url'));
