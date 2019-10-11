import * as nem from 'nem2-sdk'
import { NemConst } from './share/NemConst'
import { DefaultOptParse } from './share/DefaultOptParse';

const optParse = new DefaultOptParse();
optParse.subscribeAddress();
const option = optParse.parse();
const endpoint = new nem.AccountHttp(option.get('url'));
const address = nem.Address.createFromRawAddress(option.get('address'))

const prettyMosaicInfos = (infos: nem.Mosaic[]) => {
	return infos
		.map((mosaic: nem.Mosaic) => {
			return `[ ${mosaic.id.toHex()} / ${mosaic.amount} ]`
		})
		.reduce((accumulator: string, currentValue: string) => {
			return accumulator + currentValue;
		});
};

const printInfo = (info: nem.AccountInfo) => {
	const data = new Map<string, string>([
		['address', info.address.plain()],
		['addressHeight', info.addressHeight.toString()],
		['publicKey', info.publicKey],
		['publicKeyHeight', info.publicKeyHeight.toString()],
		['accountType', `${info.accountType}`],
		['linkedAccountKey', info.linkedAccountKey],
		['activityBucket', 'unsupport so far'],
		['mosaics', prettyMosaicInfos(info.mosaics)],
		['importance', info.importance.toString()],
		['importanceHeight', info.importanceHeight.toString()]
	]);
	data.forEach((v, k) => {
		console.log(`${k} : ${v}`);
	});
};

endpoint.getAccountInfo(address).subscribe(
	x => printInfo(x),
	err => console.log(err),
);
