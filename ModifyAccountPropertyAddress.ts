// ** USAGE **
//
//    $ ts-node ModifyAccountPropertyAddress.ts <private key> <address> <AllowAccount|BlockAccount> <Add|Remove>
//
//    ( All arguments (4 args) are required.)
//
//    private key : modified account private key (this script can't deal with multisig )
//    address : target address
//    AllowAccount | BlockAccount : PropertyType
//    Add | Remove : PropertyModificationType
//
//    (e.g) $ ts-node ModifyAccountPropertyAddress.ts <your private key> SDT5FPHDF37ZY5LIR3UKD2J4FMO43NQXRTY4U45E AllowAddress Add

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
    'propertyType',
    (arg: string) => { return arg === 'AllowAddress' || arg === 'BlockAddress' },
    true,
    (arg: string) => { return `${(<any>nem.PropertyType)[arg]}` }
);
optParse.subscribe(
    'modificationType',
    (arg: string) => { return arg === 'Add' || arg === 'Remove' },
    true,
    (arg: string) => { return `${(<any>nem.PropertyModificationType)[arg]}` }
);
const option = optParse.parse();

const privateKey = option.get('privateKey');
const address = option.get('address');
const propertyType = option.get('propertyType'); // propertyType  : base of account property type. AllowAccount or BlockAccount(Deny)
const modificationType = option.get('modificationType'); // modificationType : modifications in "propertyType". Add or Remove

const modifiedAccount = nem.Account.createFromPrivateKey(privateKey, netType);
const targetAddress = nem.Address.createFromRawAddress(address);
const modifications = [
    nem.AccountPropertyModification.createForAddress(parseInt(modificationType), targetAddress)
];

const modifyAccountPropertyAddressTx = nem.AccountPropertyTransaction.createAddressPropertyModificationTransaction(
    nem.Deadline.create(),
    parseInt(propertyType),
    modifications,
    netType
);

TxUtil.sendSinglesigTx(modifiedAccount, modifyAccountPropertyAddressTx, option.get('url'));
