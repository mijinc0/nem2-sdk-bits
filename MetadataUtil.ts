import * as nem from 'nem2-sdk';

type DeltaSet = {value: string, size: number};

export module MetadataUtil {
  export function createDeltaSet(newValue: string, previousValue = ''): DeltaSet {
    // to byte
    const newValueBytes = nem.Convert.utf8ToUint8(newValue);
    const previousValueBytes = nem.Convert.utf8ToUint8(previousValue);
    // size
    const newValueByteSize = newValueBytes.length;
    const previousValueByteSize = previousValueBytes.length;
    // delta
    const valueDelta = nem.Convert.decodeHex(nem.Convert.xor(previousValueBytes, newValueBytes)); // valueDelta = previousValueBytes xor newValueBytes
    const sizeDelta = newValueByteSize - previousValueByteSize;
    return {value: valueDelta, size: sizeDelta};
  }
}
