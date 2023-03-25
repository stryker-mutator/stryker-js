export default interface Constructor {
  name: string;
  new (...params: any[]): any;
}
