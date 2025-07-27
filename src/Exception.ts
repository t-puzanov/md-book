export class Exception extends Error {
  public readonly reason: string;

  constructor(reason: string) {
    super();
    this.reason = reason;
    this.name = 'Exception';
  }
}
