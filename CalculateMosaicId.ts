import {
  PublicAccount, UInt64, NetworkType, MosaicId, MosaicNonce
} from 'nem2-sdk'

// calc nemesis modaic id
const netType = NetworkType.MIJIN_TEST

const nemesisPubKey = '5D0FED1C3FA5A3E3BBB26A84B4A4A5B097FAE3F829FEFED43C5B25C7DE4C7F8D';

const nemesisAcc    = PublicAccount.createFromPublicKey( nemesisPubKey , netType );

const mosaicNonce   = MosaicNonce.createFromHex( '00000000' );

const xemMosaicId   = MosaicId.createFromNonce( mosaicNonce , nemesisAcc );

console.log( 'calculatedMosaicID : %s' , xemMosaicId.toHex() );
