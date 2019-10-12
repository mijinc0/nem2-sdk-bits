// toolディレクトリに addresses.yaml (bootstrapが出力してくれるやる) を置いて、
// このスクリプトを実行すると、オプションをある程度設定したコマンドを出力してくれる。
// 出力されたコマンドはテキストなので、コピペしてターミナルから実行して。

import * as yaml from 'js-yaml';
import * as fs from 'fs';
import {NemConst} from '../share/NemConst'

const addrs = yaml.safeLoad(fs.readFileSync(`${__dirname}/addresses.yaml`, 'utf-8'))['nemesis_addresses'];

// primary
const privateKey = addrs[0].private;
const publicKey  = addrs[0].public;
const address = addrs[0].address;

const cmdContexts = [
	['AccountObserver.ts', address],
	['SendTransferTx.ts', privateKey, address, '100', '-mgoodluck'],
	['CreateNewRootNamespace.ts', privateKey, '40', '-nalice'],
	['CreateNewSubNamespace.ts', privateKey, 'alice:child'],
	['CreateNewMosaic.ts', privateKey],
	['AccountLinkTx.ts', privateKey,`-k${addrs[5].public}`, 'Link'],
	['AddressAliasTx.ts', privateKey, address,`-nalice`, 'Link'],
	['CalculateMosaicId.ts'],
	['CalculateNamespaceID.ts', `-nalice`],
	['CreateMultisigAccount.ts', addrs[7].private, `-c${addrs[2].private}:${addrs[3].private}`, '-a+2', '-r+2' ],
	['GetAccountInfo.ts', address],
	['GetBlockchainHeight.ts'],
	['GetNamespaceInfo.ts', '-nalice'],
	['AccountRestrictionAddress.ts', addrs[1].private, addrs[2].address, 'BlockAddress', 'Add'],
	['AccountRestrictionMosaic.ts', addrs[1].private, 'BlockMosaic', NemConst.CURRENCY_MOSAIC_ID, 'Add'],
	['ModifyAccountPropertyAddress.ts', addrs[1].private, addrs[2].address, 'BlockAddress', 'Add'],
	['ModifyAccountPropertyEntityType.ts', addrs[1].private, 'BlockTransaction', 'TRANSFER', 'Add'],
	['ModifyAccountPropertyMosaic.ts', addrs[1].private, 'BlockMosaic', NemConst.CURRENCY_MOSAIC_ID, 'Add'],
	['MosaicAliasTx.ts', privateKey, '-nalice', `-m${NemConst.CURRENCY_MOSAIC_ID}`,'Link'],
	['MosaicSupplyChangeTx.ts', privateKey, '0000000000000000', '+100'],
	['SecretLockTx.ts', privateKey, address, '-s4f43462ed6eec19fb12dfbd80f7fccaaceb3faaba8c1c169a0b63a6cd0aa3950', 20, 'Op_Sha3_256'],
	['SecretProofTx.ts', addrs[1].private, addrs[1].address, '-s4f43462ed6eec19fb12dfbd80f7fccaaceb3faaba8c1c169a0b63a6cd0aa3950', '-p746869734973536563726574', 'Op_Sha3_256'],
	['SendTransferTxUsingAddressAlias.ts', privateKey, address, 100, '-aalice', '-muse_address_alias'],
	['SendAggregateTx.ts'],
	['MosaicGlobalRestrictionTransaction',privateKey,`--target=0000000000000000`,'--refer=0000000000000000','--key=0000000000000001','--prev=NONE:0','--new=EQ:1'],
	['MosaicAddressRestrictionTransaction',privateKey,addrs[3].address,`--mosaic=0000000000000000`,'--key=0000000000000001','--prev=0','--new=1'],
];

cmdContexts.forEach( context=>{
	const cmd = context.reduce( (a: string,b: string)=>{ return a + ' ' + b } )
	console.log(`ts-node ${cmd}`);
});
