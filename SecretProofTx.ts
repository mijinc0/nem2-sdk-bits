import * as nem from 'nem2-sdk';
import { TxUtil } from './share/TxUtil'
import { DefaultOptParse } from './share/OptParse';

const netType = nem.NetworkType.MIJIN_TEST;
const currencyMosaicId = new nem.MosaicId('6EEC7FB674DD1DDB');

const url = 'http://localhost:3000';

const option = new DefaultOptParse().parse();
const privateKey = option.get('privateKey');
const answerer = nem.Account.createFromPrivateKey(privateKey, netType);

const hashType = nem.HashType.Op_Sha3_256;
const secret = '4f43462ed6eec19fb12dfbd80f7fccaaceb3faaba8c1c169a0b63a6cd0aa3950';
const recipient = answerer.address;
// thisIsSecret = ascii => 746869734973536563726574
const proof = '746869734973536563726574'; // proof length should be 10-1000 byte

// This is version COW (specification will change in Dragon)
const secretProofTx = nem.SecretProofTransaction.create(
    nem.Deadline.create(),
    hashType,
    secret,
    proof,
    netType
);

TxUtil.sendSinglesigTx(answerer, secretProofTx, url);
