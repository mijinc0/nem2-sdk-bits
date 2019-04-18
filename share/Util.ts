export module Util {
  // not convert unsafe integer ( < 2^53 )
  export function hexToDecimal( hex: string ){
    return parseInt( hex, 16 ) < Number.MAX_SAFE_INTEGER ? parseInt( hex, 16 ) : NaN ;
  }

  export function hexStrToDecimalStr( hex: string ){
    const decimal = hexToDecimal( hex );
    return isNaN( decimal ) ? 'too big number' : decimal.toString();
  }

  export function notUndefined( obj: any ) :boolean {
    return typeof( obj ) !== 'undefined';
  }

  export function isBase32( s: string ) :boolean {
    return (/^[ABCDEFGHIJKLMNOPQRSTUVWXYZ234567]{40}$/).test( s.toUpperCase() )
  }
}
