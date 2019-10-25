import * as nem from 'nem2-sdk';
import { NemConst } from './share/NemConst'
import { Util } from './share/Util'
import { DefaultOptParse } from './share/DefaultOptParse';

const netType = nem.NetworkType.MIJIN_TEST;
const optParse = new DefaultOptParse();
optParse.subscribe(
  'mosaicID',
  (arg: string) => { return (/^[0-9A-Fa-f]{16}$/).test(arg) },
  true,
);
const option = optParse.parse();

const printInfo = (meta: nem.Metadata[]) => {
  console.log(`== MetadataInfomation of ${option.get('mosaicID')} ==`);
  if(meta.length === 0) console.log(`empty`);
  meta.forEach(m => {
    console.log(`ID : ${m.id}`);
    const entry = m.metadataEntry;
    console.table({
      compositeHash: entry.compositeHash,
      metadataType: `${(<any>nem.MetadataType)[entry.metadataType]}`,
      scopedMetadataKey: entry.scopedMetadataKey.toHex(),
      senderPublicKey: entry.senderPublicKey,
      targetId: entry.targetId ? entry.targetId.toHex() : 'undefined',
      targetPublicKey: entry.targetPublicKey,
      value: entry.value,
      valueSize: entry.valueSize.toString(),
    });
  });
};

const id = new nem.MosaicId(option.get('mosaicID'));
const metadataHttp = new nem.MetadataHttp(option.get('url'));
metadataHttp.getMosaicMetadata(id).subscribe(
  x => printInfo(x),
  e => console.error(e.message)
);
