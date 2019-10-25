import * as nem from 'nem2-sdk';
import { NemConst } from './share/NemConst'
import { Util } from './share/Util'
import { DefaultOptParse } from './share/DefaultOptParse';

const netType = nem.NetworkType.MIJIN_TEST;
const optParse = new DefaultOptParse();
optParse.subscribe(
  'namespace',
  (arg: string) => { return (/^--namespace=\w+$/).test(arg) },
  true,
  (arg: string) => { return arg.slice(12) }
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

const id = new nem.NamespaceId(option.get('namespace'));
const metadataHttp = new nem.MetadataHttp(option.get('url'));
metadataHttp.getNamespaceMetadata(id).subscribe(
  x => printInfo(x),
  e => console.error(e.message)
);
