interface ISyncKeyStrategy {
  getKey(
    className: string,
    methodName: string,
    args: any[]
  ): string | undefined;
}

interface IAsyncKeyStrategy {
  getKey(
    className: string,
    methodName: string,
    args: any[]
  ): Promise<string | undefined> | string | undefined;
}

export { IAsyncKeyStrategy, ISyncKeyStrategy };
