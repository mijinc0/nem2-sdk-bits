import * as nem from 'nem2-sdk';
import { TxUtil } from './share/TxUtil'
import { NemConst } from './share/NemConst'
import { DefaultOptParse } from './share/DefaultOptParse';

const netType = NemConst.NETWORK_TYPE;
const currencyMosaicId = new nem.MosaicId(NemConst.CURRENCY_MOSAIC_ID);

const optParse = new DefaultOptParse();
optParse.subscribePrivateKey();
optParse.subscribe(
  'namespace',
  (arg: string) => { return (/^\w+:\w+$/).test(arg) },
  true
);
const option = optParse.parse();

const privateKey = option.get('privateKey');
const issuer = nem.Account.createFromPrivateKey(privateKey, netType);

const namespace = option.get('namespace').split(':');
const parentNamespaceName = namespace[0];
const subNamespaceName = namespace[1];

const registerNamespaceTx = nem.NamespaceRegistrationTransaction.createSubNamespace(
  nem.Deadline.create(),
  subNamespaceName,
  parentNamespaceName,
  netType
);

TxUtil.sendSinglesigTx(issuer, registerNamespaceTx, option.get('url'));
