export module Util {
  // not convert unsafe integer ( < 2^53 )
  export function hexToDecimal(hex: string) {
    return parseInt(hex, 16) < Number.MAX_SAFE_INTEGER ? parseInt(hex, 16) : NaN;
  }

  export function hexStrToDecimalStr(hex: string) {
    const decimal = hexToDecimal(hex);
    return isNaN(decimal) ? 'too big number' : decimal.toString();
  }

  export function isUndefined(obj: any): boolean {
    return typeof (obj) === 'undefined';
  }

  export function notUndefined(obj: any): boolean {
    return typeof (obj) !== 'undefined';
  }

  export function isBase32(s: string): boolean {
    return (/^[ABCDEFGHIJKLMNOPQRSTUVWXYZ234567]+$/).test(s.toUpperCase());
  }

  export function isAddressFormat(s: string): boolean {
    return isBase32(s) && s.length === 40;
  }

  export function isHex(s: string): boolean {
    return (/^[0-9A-Fa-f]+$/).test(s);
  }

  export function notHex(s: string): boolean {
    return !isHex(s);
  }

  export function isKeyFormat(s: string): boolean {
    return isHex(s) && s.length === 64;
  }

  export function is64bitFormat(s: string): boolean {
    return isHex(s) && s.length === 16;
  }
}
