import * as Assert from "assert";
import { Cache, ExpirationStrategy, ISyncKeyStrategy } from "../src/index.js";
import { MemoryStorage } from "../src/storage/memory/index.js";
import { IAsyncKeyStrategy } from "../src/types/key.strategy.types.js";

const storage = new MemoryStorage();
const strategy = new ExpirationStrategy(storage);
const data = ["user", "max", "test"];

class TestClassOne {
  callCount = 0;

  @Cache(storage, {}) // beware, no expirationstrategy used, therefore this is never ttled because memory storage cannot do this by its own
  public storageUser(): string[] {
    return data;
  }

  @Cache(strategy, { ttl: 1000 })
  public getUsers(): string[] {
    this.callCount++;
    return data;
  }

  @Cache(strategy, { ttl: 1000 })
  public getUsersPromise(): Promise<string[]> {
    return Promise.resolve(data);
  }

  @Cache(strategy, { ttl: 1000 })
  public getUndefinedValue(): Promise<undefined> {
    this.callCount++;
    return Promise.resolve(undefined);
  }

  @Cache(strategy, { ttl: 1000 })
  public getFalseValue(): Promise<boolean> {
    this.callCount++;
    return Promise.resolve(false);
  }

  @Cache(strategy, { ttl: 1000 })
  public getNullValue(): Promise<null> {
    this.callCount++;
    return Promise.resolve(null);
  }
}

class TestClassTwo {
  @Cache(strategy, { ttl: 20000 })
  public async getUsers(): Promise<string[]> {
    return new Promise<string[]>((resolve) => {
      setTimeout(() => resolve(data), 0);
    });
  }

  public async throwErrorPlain(): Promise<string[]> {
    throw new Error("stacktrace?");
  }

  @Cache(strategy, { ttl: 20000 })
  public async throwError(): Promise<string[]> {
    throw new Error("stacktrace?");
  }

  @Cache(
    strategy,
    { ttl: 20000 },
    {
      getKey(): string | undefined {
        return undefined; // no cache
      },
    }
  )
  public async throwErrorNoCache(): Promise<string[]> {
    throw new Error("stacktrace?");
  }
}

class CustomJsonStrategy implements ISyncKeyStrategy {
  public getKey(className: string, methodName: string, args: any[]): string {
    return `${className}:${methodName}:${JSON.stringify(args)}:foo`;
  }
}

/**
 * This custom test key strategy only uses the method name as caching key
 */
class CustomKeyStrategy implements IAsyncKeyStrategy {
  public getKey(
    _className: string,
    methodName: string,
    _args: any[]
  ): Promise<string> | string {
    return new Promise((resolve) => {
      setTimeout(() => resolve(methodName), 0);
    });
  }
}

class TestClassThree {
  @Cache(strategy, { ttl: 1000 }, new CustomJsonStrategy())
  public getUsers(): string[] {
    return data;
  }

  @Cache(strategy, { ttl: 1000 }, new CustomJsonStrategy())
  public getUsersPromise(): Promise<string[]> {
    return Promise.resolve(data);
  }
}

class TestClassFour {
  @Cache(strategy, { ttl: 500 }, new CustomKeyStrategy())
  public getUsersPromise(): Promise<string[]> {
    return Promise.resolve(data);
  }
}

describe("CacheDecorator", () => {
  beforeEach(async () => {
    await strategy.clear();
  });

  it("Should decorate function with ExpirationStrategy correctly", async () => {
    const myClass = new TestClassOne();
    await myClass.getUsersPromise();
  });

  it("Should cache function call correctly", async () => {
    const myClass = new TestClassOne();

    const users = await myClass.getUsers();

    Assert.strictEqual(data, users);
    Assert.strictEqual(
      await strategy.getItem<string[]>("TestClassOne:getUsers:[]"),
      data
    );
  });

  it("Should cache function call correctly via storage", async () => {
    const myClass = new TestClassOne();

    const users = await myClass.storageUser();

    Assert.strictEqual(data, users);
    Assert.strictEqual(
      await storage.getItem<string[]>("TestClassOne:storageUser:[]"),
      data
    );
  });

  it("Should prevent calling same method several times", async () => {
    const myClass = new TestClassOne();

    await Promise.all([
      myClass.getUsers(),
      myClass.getUsers(),
      myClass.getUsers(),
    ]);

    Assert.strictEqual(myClass.callCount, 1);

    await Promise.all([
      myClass.getUsers(),
      myClass.getUsers(),
      myClass.getUsers(),
    ]);

    Assert.strictEqual(myClass.callCount, 1);
  });

  it("Check if undefined return values is NOT cached", async () => {
    const myClass = new TestClassOne();

    await myClass.getUndefinedValue();

    Assert.strictEqual(myClass.callCount, 1);

    await myClass.getUndefinedValue();

    Assert.strictEqual(myClass.callCount, 2);
  });

  it("Check if false return values is cached", async () => {
    const myClass = new TestClassOne();

    await Promise.all([
      myClass.getFalseValue(),
      myClass.getFalseValue(),
      myClass.getFalseValue(),
    ]);

    Assert.strictEqual(myClass.callCount, 1);

    await Promise.all([
      myClass.getFalseValue(),
      myClass.getFalseValue(),
      myClass.getFalseValue(),
    ]);

    Assert.strictEqual(myClass.callCount, 1);
  });

  it("Check if null return values is also cached", async () => {
    const myClass = new TestClassOne();

    await Promise.all([
      myClass.getNullValue(),
      myClass.getNullValue(),
      myClass.getNullValue(),
    ]);

    Assert.strictEqual(myClass.callCount, 1);

    await Promise.all([
      myClass.getNullValue(),
      myClass.getNullValue(),
      myClass.getNullValue(),
    ]);

    Assert.strictEqual(myClass.callCount, 1);
  });

  it("Should cache Promise response correctly", async () => {
    const myClass = new TestClassOne();

    await myClass.getUsersPromise().then(async (response) => {
      Assert.strictEqual(data, response);
      Assert.strictEqual(
        await strategy.getItem<string[]>("TestClassOne:getUsersPromise:[]"),
        data
      );
    });
  });

  it("Should cache async response correctly", async () => {
    const myClass = new TestClassTwo();

    const users = await myClass.getUsers();
    Assert.strictEqual(data, users);
    Assert.strictEqual(
      await strategy.getItem<string[]>("TestClassTwo:getUsers:[]"),
      data
    );
  });

  it("Should have valid stacktrace", async () => {
    const myClass = new TestClassTwo();

    try {
      await myClass.throwError();
    } catch (err: any) {
      console.log(err.stack);
    }
  });

  it("Should have valid stacktrace - no cache", async () => {
    const myClass = new TestClassTwo();

    try {
      await myClass.throwErrorNoCache();
    } catch (err: any) {
      console.log(err.stack);
    }
  });

  it("Should have valid stacktrace - plain", async () => {
    const myClass = new TestClassTwo();

    try {
      await myClass.throwErrorPlain();
    } catch (err: any) {
      console.log(err.stack);
    }
  });

  it("Should cache function call correctly (custom key strategy)", async () => {
    const myClass = new TestClassThree();

    const users = await myClass.getUsers();

    Assert.strictEqual(data, users);
    Assert.strictEqual(
      await strategy.getItem<string[]>("TestClassThree:getUsers:[]:foo"),
      data
    );
  });

  it("Should cache Promise response correctly (custom key strategy)", async () => {
    const myClass = new TestClassThree();

    await myClass.getUsersPromise().then(async (response) => {
      Assert.strictEqual(data, response);
      Assert.strictEqual(
        await strategy.getItem<string[]>(
          "TestClassThree:getUsersPromise:[]:foo"
        ),
        data
      );
    });
  });

  it("Should cache users with async custom key strategy correctly", async () => {
    const myClass = new TestClassFour();

    await myClass.getUsersPromise().then(async (response) => {
      Assert.strictEqual(data, response);
      Assert.strictEqual(
        await strategy.getItem<string[]>("getUsersPromise"),
        data
      );
    });
  });
});
