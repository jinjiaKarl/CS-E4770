import { brightRed, brightBlack} from "https://deno.land/std/fmt/colors.ts";

export function printError(msg) {
  console.log(`${brightRed("Error")}: ${msg}`);
}


export function printInfo(msg) {
    console.log(`${brightBlack("Info")}: ${msg}`);
}

export function toBaseN(num, base) {
    if (num === 0) {
      return '0';
    }
    var digits = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var len = Math.min(digits.length, base);
    var result = ''; 
    while (num > 0) {
      result = digits[num % len] + result;
      num = parseInt(num / len, 10);
    }
    return result;
}

// single machine
export function getRandomString(s) {
  if (s % 2 == 1) {
    throw new Deno.errors.InvalidData("Only even sizes are supported");
  }
  const buf = new Uint8Array(s / 2);
  crypto.getRandomValues(buf);
  let ret = "";
  for (let i = 0; i < buf.length; ++i) {
    ret += ("0" + buf[i].toString(16)).slice(-2);
  }
  return ret;
}
