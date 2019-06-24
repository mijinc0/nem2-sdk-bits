// ** USAGE **
//    link account to remote(delegate) harvesting
//
//    $ ts-node AddressAliasTx.ts <private key> <remote account key> <linkAction>
//
//             address : address
//    remoteAccountKey : '-k' + publickey(hex)
//     aliasActionType : Link or Unlink
//
//    $ ts-node AccountLinkTx.ts <your private key> Link -k7E45327CEE119F03176B8C477C81A90DD05601097F8A74432CB1EF30AC331EFB

import * as nem from 'nem2-sdk';
import { NemConst } from './share/NemConst'
import { Util } from './share/Util'
import { TxUtil } from './share/TxUtil'
import { DefaultOptParse } from './share/DefaultOptParse';

const netType = NemConst.NETWORK_TYPE;

const optParse = new DefaultOptParse();
optParse.subscribePrivateKey();
optParse.subscribe(
    'linkAction',
    (arg: string) => { return arg === 'Link' || arg === 'Unlink' },
    true,
    (arg: string) => { return `${(<any>nem.LinkAction)[arg]}` }
);
optParse.subscribe(
    'remoteAccountKey',
    (arg: string) => { return (/^-k[0-9A-Fa-f]{64}$/).test(arg) },
    true,
    (arg: string) => { return arg.slice(2) }
);
const option = optParse.parse();

const accountLinkTx = nem.AccountLinkTransaction.create(
    nem.Deadline.create(),
    option.get('remoteAccountKey'),
    parseInt(option.get('linkAction')),
    netType
);

const harvester = nem.Account.createFromPrivateKey(option.get('privateKey'), netType);

TxUtil.sendSinglesigTx(harvester, accountLinkTx, option.get('url'));
