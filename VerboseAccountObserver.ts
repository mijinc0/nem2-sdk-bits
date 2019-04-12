import * as nem from 'nem2-sdk';

function hexToDecimal( hex: string ){
  return parseInt( hex, 16 ) < Number.MAX_SAFE_INTEGER ? parseInt( hex, 16 ) : NaN ;
}

function hexStrToDecimalStr( hex: string ){
  const decimal = hexToDecimal( hex );
  return isNaN( decimal ) ? 'too big number' : decimal.toString();
}

function notUndefined( obj: any ) :boolean {
  return typeof( obj ) !== 'undefined';
}

function errorSubject( err: any ){
  console.error( err );
}

function isProperty( name: string ): name is keyof nem.TransactionType {
  return Object.keys( nem.TransactionType ).indexOf( name ) > -1;
}

// using User-Defined Type Guards
// https://www.typescriptlang.org/docs/handbook/advanced-types.html
function readableType( num: number ): string {
  const keys = Object.keys( nem.TransactionType );

  const readable = keys.find( k => {
    if( isProperty( k ) ) return nem.TransactionType[ k ] === num;
  });

  return notUndefined( readable ) ? readable : 'unknown';
}

function txToPretty( tx: nem.Transaction, putHeadFunc: Function, putLineFunc: Function ){

  const type   = readableType( tx.type );
  const height = notUndefined( tx.transactionInfo ) ? hexStrToDecimalStr( tx.transactionInfo.height.toHex() ) : 'unknown';
  const hash   = notUndefined( tx.transactionInfo ) ? tx.transactionInfo.hash : 'unknown';

  let log = '';

  log += putHeadFunc('NewConfirmedTransactionInfo');
  log += putLineFunc(`type   : ${type}`);
  log += putLineFunc(`height : ${height}`);
  log += putLineFunc(`hash   : ${hash}`);

  return log;
}

function accountToPretty( info: nem.AccountInfo, putHeadFunc: Function, putLineFunc: Function ){

  const addr    = info.address;
  const pubKey  = info.publicKey;
  const imp     = hexStrToDecimalStr( info.importance.toHex() );
  const mosaics = info.mosaics;

  let log = '';

  log += putHeadFunc('CurrentAccountInfo');
  log += putLineFunc(`address    : ${addr.plain()}`);
  log += putLineFunc(`publicKey  : ${pubKey}`);
  log += putLineFunc(`importance : ${imp}`);

  log += putHeadFunc('CurrentMosaicInfo');
  mosaics.forEach( mosaic => {
    const id = mosaic.id.toHex();
    const amount = hexStrToDecimalStr( mosaic.amount.toHex() );
    log += putLineFunc(`[${id}] ${amount}`);
  });

  return log;
}

function toPretty( tx: nem.Transaction, info: nem.AccountInfo ){
  const indent = ' '.repeat( 3 );

  const head = ( str: string | number ) => { return `${str}\n` };
  const line = ( str: string | number ) => { return `${indent}${str}\n` };

  const txInfo  = txToPretty( tx, head, line );
  const accInfo = accountToPretty( info, head, line );
  return `\n${txInfo}${accInfo}`;
}

function printNewInfo ( tx: nem.Transaction, addr: nem.Address, accHttp: nem.AccountHttp ){
  accHttp.getAccountInfo( addr ).subscribe(
    info => { console.log( toPretty( tx, info ) ); },
    errorSubject,
  );
}

function printTxErr( txStateErr: nem.TransactionStatusError ){
  const red     = '\u001b[31m';
  const reset   = '\u001b[0m';

  const hash = txStateErr.hash;
  const msg  = txStateErr.status;

  console.log( `\n${red}TxDropped!\nhash:${hash}\nmessage:${msg}\n${reset}` );
}

const rawAddr = process.argv[ process.argv.length - 1 ];

const addr = nem.Address.createFromRawAddress( rawAddr );

const url = 'http://localhost:3000';

const listener = new nem.Listener( url );
const accHttp  = new nem.AccountHttp( url );

// listener open and set subjects
listener.open().then( () => {
  // for Error
  listener.status( addr ).subscribe(
    txStateErr => { printTxErr( txStateErr ); },
    errorSubject,
  );

  listener.confirmed( addr ).subscribe(
    tx => { printNewInfo( tx, addr, accHttp ); },
    errorSubject,
  );
});
