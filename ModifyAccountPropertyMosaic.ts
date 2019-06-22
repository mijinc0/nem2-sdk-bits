// ** USAGE **
//    Transaction Blocking Property
//
//    $ ts-node ModifyAccountPropertyEntity.ts <private key> <AllowMocaic|BlockMosaic> <Add|Remove> <MosaicId( 8byte-hex )>
//
//    ( All arguments (4 args) are required.)
//

import * as nem from 'nem2-sdk';
import { NemConst } from './share/NemConst'
import { Util } from './share/Util'
import { TxUtil } from './share/TxUtil'
import { DefaultOptParse } from './share/DefaultOptParse';

const netType = nem.NetworkType.MIJIN_TEST;
const currencyMosaicId = new nem.MosaicId(NemConst.CURRENCY_MOSAIC_ID);

const optParse = new DefaultOptParse();
optParse.subscribePrivateKey();
optParse.subscribe(
    'propertyType',
    (arg: string) => { return arg === 'AllowMosaic' || arg === 'BlockMosaic' },
    true,
    (arg: string) => { return `${(<any>nem.PropertyType)[arg]}` }
);
optParse.subscribe(
    'modificationType',
    (arg: string) => { return arg === 'Add' || arg === 'Remove' },
    true,
    (arg: string) => { return `${(<any>nem.PropertyModificationType)[arg]}` }
);
optParse.subscribe(
    'mosaicId',
    (arg: string) => { return Util.isHex(arg) && arg.length === 16 },
    true
);
const option = optParse.parse();

const privateKey = option.get('privateKey');
const propertyType = option.get('propertyType');
const modificationType = option.get('modificationType');
const hexMosaicId = option.get('mosaicId');

// argument check
[privateKey, propertyType, modificationType, hexMosaicId].forEach(arg => {
    if (Util.isUndefined(arg)) {
        console.error(`argument parse fault.`);
        process.exit(1);
    }
});

const modifiedAccount  = nem.Account.createFromPrivateKey(privateKey, netType);
const modifiedMosaicId = new nem.MosaicId(hexMosaicId);
const modifications = [
    nem.AccountPropertyModification.createForMosaic(parseInt(modificationType),modifiedMosaicId )
];

const modifyAccountPropertyAddressTx = nem.AccountPropertyTransaction.createMosaicPropertyModificationTransaction(
    nem.Deadline.create(),
    parseInt(propertyType),
    modifications,
    netType
);

TxUtil.sendSinglesigTx(modifiedAccount, modifyAccountPropertyAddressTx, option.get('url'));
