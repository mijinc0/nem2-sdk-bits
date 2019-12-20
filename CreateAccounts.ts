import * as nem from 'nem2-sdk';
import { NemConst } from './share/NemConst'

const netType = NemConst.NETWORK_TYPE;
const size = 30;

function num(max: number = Number.MAX_SAFE_INTEGER): number {
  return Math.floor(Math.random() * Math.floor(max + 1));
}

function hexByte(byteSize: number): string {
  let buffer = '';
  const hexLen = byteSize * 2;
  while(buffer.length < hexLen){
    const fourByteHex = num(0xFFFFFFFF).toString(16);
    buffer += fourByteHex;
  }
  return buffer.slice(0, hexLen);
}

for(let k = 0; k < size; k++){
  const privateKey = hexByte(32);
  const account = nem.Account.createFromPrivateKey(privateKey, netType);
  console.log(`private : ${privateKey}`);
  console.log(`public  : ${account.publicKey}`);
  console.log(`address : ${account.address.plain()}`);
  console.log('');
}
