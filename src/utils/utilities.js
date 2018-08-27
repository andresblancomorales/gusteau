export function isDefined(variable) {
  return typeof variable !== 'undefined' && variable !== null;
}

export function getUTCNow() {
  return new Date().getTime();
}