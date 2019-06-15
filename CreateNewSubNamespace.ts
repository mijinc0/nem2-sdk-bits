import * as nem from 'nem2-sdk';
import { TxUtil } from './share/TxUtil'
import { DefaultOptParse } from './share/OptParse';

const netType = nem.NetworkType.MIJIN_TEST;
const currencyMosaicId = new nem.MosaicId('6EEC7FB674DD1DDB');

const url = 'http://localhost:3000';

const option = new DefaultOptParse().parse();
const privateKey = option.get('privateKey');
const issuer = nem.Account.createFromPrivateKey(privateKey, netType);

const subNamespaceName = 'dragon';
const parentNamespaceName = 'cowcow';

const registerNamespaceTx = nem.RegisterNamespaceTransaction.createSubNamespace(
    nem.Deadline.create(),
    subNamespaceName,
    parentNamespaceName,
    netType
);

TxUtil.sendSinglesigTx(issuer, registerNamespaceTx, url);
