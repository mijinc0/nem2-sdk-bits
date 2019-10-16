import * as nem from 'nem2-sdk';
import { NemConst } from './share/NemConst'
import { Util } from './share/Util'
import { TxUtil } from './share/TxUtil'
import { DefaultOptParse } from './share/DefaultOptParse';

const netType = nem.NetworkType.MIJIN_TEST;

const optParse = new DefaultOptParse();
optParse.subscribePrivateKey();
optParse.subscribeAddress();
optParse.subscribe(
  'restrectedMosaicId',
  (arg: string) => { return (/^--mosaic=[0-9A-Fa-f]{16}$/).test(arg) },
  true,
  (arg: string) => { return arg.slice(9) }
);
optParse.subscribe(
  'restrictionKey',
  (arg: string) => { return (/^--key=[0-9A-Fa-f]{16}$/).test(arg) },
  true,
  (arg: string) => { return arg.slice(6) }
);
optParse.subscribe(
  'newValue',
  (arg: string) => { return (/^--new=\d+$/).test(arg) },
  true,
  (arg: string) => { return arg.slice(6) }
);
optParse.subscribe(
  'previousValue',
  (arg: string) => { return (/^--prev=\d+$/).test(arg) },
  false,
  (arg: string) => { return arg.slice(7) }
);
const option = optParse.parse();

const targetAddress = nem.Address.createFromRawAddress(option.get('address'));
const mosaicId = new nem.MosaicId(option.get('restrectedMosaicId'));
const restrictionKey = nem.UInt64.fromHex(option.get('restrictionKey'));
const newRawValue = parseInt(option.get('newValue'));
const newValue = nem.UInt64.fromUint(newRawValue);
const previousRawValue = option.get('previousValue') ? parseInt(option.get('previousValue')) : undefined;
const previousValue = previousRawValue ? nem.UInt64.fromUint(previousRawValue) : undefined;

console.table({
  targetAddress: targetAddress.plain(),
  mosaicId: mosaicId.toHex(),
  restrictionKey: restrictionKey.toString(),
  newValue: newRawValue.toString(),
  previousValue: previousValue ? previousValue.toString() : 'undefined'
});

const mosaicAddressRestrictionTx = nem.MosaicAddressRestrictionTransaction.create(
  nem.Deadline.create(),
  mosaicId,
  restrictionKey,
  targetAddress,
  newValue,
  netType,
  previousValue,
);

const privateKey = option.get('privateKey');
const mosaicIssuer = nem.Account.createFromPrivateKey(privateKey, netType);
TxUtil.sendSinglesigTx(mosaicIssuer, mosaicAddressRestrictionTx, option.get('url'));
