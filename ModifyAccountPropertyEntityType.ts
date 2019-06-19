// ** USAGE **
//    Transaction Blocking Property
//
//    $ ts-node ModifyAccountPropertyEntity.ts <private key> <AllowTransaction|BlockTransaction> <Add|Remove> <TransationType>
//
//    ( All arguments (4 args) are required.)
//
//    TransactionType
//        'TRANSFER', 'REGISTER_NAMESPACE', 'ADDRESS_ALIAS', 'MOSAIC_ALIAS',
//        'MOSAIC_DEFINITION', 'MOSAIC_SUPPLY_CHANGE', 'MODIFY_MULTISIG_ACCOUNT',
//        'AGGREGATE_COMPLETE', 'AGGREGATE_BONDED', 'LOCK', 'SECRET_LOCK', 'SECRET_PROOF',
//        'MODIFY_ACCOUNT_PROPERTY_ADDRESS', 'MODIFY_ACCOUNT_PROPERTY_MOSAIC',
//        'MODIFY_ACCOUNT_PROPERTY_ENTITY_TYPE', 'LINK_ACCOUNT'
//

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
    (arg: string) => { return arg === 'AllowTransaction' || arg === 'BlockTransaction' },
    (arg: string) => { return `${(<any>nem.PropertyType)[arg]}` }
);
optParse.subscribe(
    'modificationType',
    (arg: string) => { return arg === 'Add' || arg === 'Remove' },
    (arg: string) => { return `${(<any>nem.PropertyModificationType)[arg]}` }
);
optParse.subscribe(
    'entityType',
    (arg: string) => { return Object.keys(nem.TransactionType).includes(arg) },
    (arg: string) => { return nem.TransactionType[<keyof nem.TransactionType>arg] }
);
const option = optParse.parse();

const privateKey = option.get('privateKey');
const propertyType = option.get('propertyType');
const modificationType = option.get('modificationType');
const entityType = option.get('entityType');

// argument check
[privateKey, propertyType, modificationType, entityType].forEach(arg => {
    if (Util.isUndefined(arg)) {
        console.error(`argument parse fault.`);
        process.exit(1);
    }
});

const modifiedAccount = nem.Account.createFromPrivateKey(privateKey, netType);
const modifications = [
    nem.AccountPropertyModification.createForEntityType(parseInt(modificationType),parseInt(entityType) )
];

const modifyAccountPropertyAddressTx = nem.AccountPropertyTransaction.createEntityTypePropertyModificationTransaction(
    nem.Deadline.create(),
    parseInt(propertyType),
    modifications,
    netType
);

TxUtil.sendSinglesigTx(modifiedAccount, modifyAccountPropertyAddressTx, url);
