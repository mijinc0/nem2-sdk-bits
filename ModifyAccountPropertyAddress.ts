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
import { DefaultOptParse } from './share/OptParse';

const netType = nem.NetworkType.MIJIN_TEST;
const currencyMosaicId = new nem.MosaicId(NemConst.CURRENCY_MOSAIC_ID);

const url = 'http://localhost:3000';

const optParse = new DefaultOptParse();
optParse.subscribe(
    'propertyType',
    (arg: string) => { return arg === 'AllowAddress' || arg === 'BlockAddress' },
    (arg: string) => { return `${(<any>nem.PropertyType)[arg]}` }
);
optParse.subscribe(
    'modificationType',
    (arg: string) => { return arg === 'Add' || arg === 'Remove' },
    (arg: string) => { return `${(<any>nem.PropertyModificationType)[arg]}` }
);
const option = optParse.parse();

const privateKey = option.get('privateKey');
const address = option.get('address');
const propertyType = option.get('propertyType'); // propertyType  : base of account property type. AllowAccount or BlockAccount(Deny)
const modificationType = option.get('modificationType'); // modificationType : modifications in "propertyType". Add or Remove

// argument check
[privateKey, address, propertyType, modificationType].forEach(arg => {
    if (Util.isUndefined(arg)) {
        console.error(`argument parse fault.`);
        process.exit(1);
    }
});

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

TxUtil.sendSinglesigTx(modifiedAccount, modifyAccountPropertyAddressTx, url);
