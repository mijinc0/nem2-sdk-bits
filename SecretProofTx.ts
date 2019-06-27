// ** USAGE **
//
//    $ ts-node SecretProofTx.ts <private key> <secret> <proof> <hashType>
//
//      secret : '-s' + 32byte hex
//       proof : '-p' + proof data hex
//    hashType : Op_Hash_160, Op_Hash_256, Op_Keccak_256, Op_Sha3_256
//
//    (e.g) ts-node SecretProofTx.ts <your private key> -s4f43462ed6eec19fb12dfbd80f7fccaaceb3faaba8c1c169a0b63a6cd0aa3950 -p746869734973536563726574  Op_Sha3_256


import * as nem from 'nem2-sdk';
import { NemConst } from './share/NemConst'
import { Util } from './share/Util'
import { TxUtil } from './share/TxUtil'
import { DefaultOptParse } from './share/DefaultOptParse';

const netType = nem.NetworkType.MIJIN_TEST;
const currencyMosaicId = new nem.MosaicId(NemConst.CURRENCY_MOSAIC_ID);

const optParse = new DefaultOptParse();
optParse.subscribePrivateKey();
optParse.subscribeAddress();
// optParse.subscribeAddress();
optParse.subscribe(
    'hashType',
    (arg: string) => { return !(/^\d*$/).test(arg) && Object.keys(nem.HashType).includes(arg) },
    true,
    (arg: string) => { return `${(<any>nem.HashType)[arg]}` }
);
optParse.subscribe(
    `secret`,
    (arg: string) => { return (/^-s[0-9A-Fa-f]{64}$/).test(arg) },
    true,
    (arg: string) => { return arg.slice(2) }
);
optParse.subscribe(
    `proof`,
    (arg: string) => { return (/^-p[0-9A-Fa-f]{20,2000}$/).test(arg) },
    true,
    (arg: string) => { return arg.slice(2) }
);
const option = optParse.parse();

const privateKey = option.get('privateKey');
const answerer = nem.Account.createFromPrivateKey(privateKey, netType);

const secret = option.get('secret');
// const recipient = nem.Address.createFromRawAddress(option.get('address'));
// thisIsSecret = ascii => 746869734973536563726574
const proof = option.get('proof'); // proof length should be 10-1000 byte
const recipient = nem.Address.createFromRawAddress(option.get('address'));;

console.log(option.get('hashType'));
console.log(secret);
console.log(proof);
// 4f43462ed6eec19fb12dfbd80f7fccaaceb3faaba8c1c169a0b63a6cd0aa3950:746869734973536563726574
const secretProofTx = nem.SecretProofTransaction.create(
    nem.Deadline.create(),
    nem.HashType.Op_Sha3_256,
    secret,
    recipient,
    proof,
    netType
);

TxUtil.sendSinglesigTx(answerer, secretProofTx, option.get('url'));
