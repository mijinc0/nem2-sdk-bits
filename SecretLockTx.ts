// ts-node SecretLockTx.ts ED39D619FF7D5F21B7D2D971339767796509F8A93B2D713EB59278F4606179BE

import * as nem from 'nem2-sdk';
import { TxUtil } from './share/TxUtil'
import { DefaultOptParse } from './share/OptParse';

const netType = nem.NetworkType.MIJIN_TEST;
const currencyMosaicId = new nem.MosaicId('6EEC7FB674DD1DDB');

const url = 'http://localhost:3000';

const option = new DefaultOptParse().parse();
const privateKey = option.get('privateKey');
const sender = nem.Account.createFromPrivateKey(privateKey, netType);

const lockedMosaic = new nem.Mosaic(currencyMosaicId, nem.UInt64.fromUint(1000));
const duration = nem.UInt64.fromUint(100);
const hashType = nem.HashType.Op_Keccak_256;
const secret = '9290C506D26276A8BCC82C5A418D4180C41D5BF46FAD7EFFA202DEF7ADE516C7'; // secret should be 32byte-hex
const recipient = sender.address;

const secretLockTx = nem.SecretLockTransaction.create(
    nem.Deadline.create(),
    lockedMosaic,
    duration,
    hashType,
    secret,
    recipient,
    netType
);

TxUtil.sendSinglesigTx(sender, secretLockTx, url);
