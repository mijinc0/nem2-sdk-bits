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
const hashType = nem.HashType.Op_Sha3_256;
// 746869734973536563726574 = Sha3_256 => 4f43462ed6eec19fb12dfbd80f7fccaaceb3faaba8c1c169a0b63a6cd0aa3950 
const secret = '4f43462ed6eec19fb12dfbd80f7fccaaceb3faaba8c1c169a0b63a6cd0aa3950'; // secret should be 32byte-hex
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
