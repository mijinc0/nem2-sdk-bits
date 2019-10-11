// ** USAGE **
//    Link moaicId to Namespace
//
//    $ ts-node AddressAliasTx.ts <private key> <address> <namespace name> <aliasActionType>
//
//            address : address
//       namespace ID : '-n' + <namespace name>
//    aliasActionType : Link or Unlink
//
//    $ ts-node AddressAliasTx.ts <your private key> SCGFCKHZBHXZF53JC5LK22EC2WCOKM47DIS5FBH2 -ndragon Link

import * as nem from 'nem2-sdk';
import { NemConst } from './share/NemConst'
import { Util } from './share/Util'
import { TxUtil } from './share/TxUtil'
import { DefaultOptParse } from './share/DefaultOptParse';

const netType = NemConst.NETWORK_TYPE;

const optParse = new DefaultOptParse();
optParse.subscribePrivateKey();
optParse.subscribeAddress();
optParse.subscribe(
  'aliasAction',
  (arg: string) => { return arg === 'Link' || arg === 'Unlink' },
  true,
  (arg: string) => { return `${(<any>nem.AliasAction)[arg]}` }
);
optParse.subscribe(
  'namespaceName',
  (arg: string) => { return (/^-n\w+$/).test(arg) },
  true,
  (arg: string) => { return arg.slice(2) }
);
const option = optParse.parse();

const sender = nem.Account.createFromPrivateKey(option.get('privateKey'), netType);
const address = nem.Address.createFromRawAddress(option.get('address'));
const aliasAction = option.get('aliasAction');
const namespaceName = option.get('namespaceName');

const addressAliasTx = nem.AddressAliasTransaction.create(
  nem.Deadline.create(),
  parseInt(aliasAction),
  new nem.NamespaceId(namespaceName),
  address,
  netType
);

console.log(`  address : ${address.plain()}`);
console.log(`namespace : ${namespaceName}`);
console.log(`   action : ${nem.AliasAction[parseInt(aliasAction)]}`);

TxUtil.sendSinglesigTx(sender, addressAliasTx, option.get('url'));
