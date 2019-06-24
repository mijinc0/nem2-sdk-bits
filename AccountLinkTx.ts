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
