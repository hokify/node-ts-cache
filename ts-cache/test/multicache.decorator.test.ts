//import * as Assert from "assert";
import { MultiCache } from "../src/decorator/multicache.decorator";
import { LRUStorage } from "../../storages/lru/src/LRUStorage";

const canonicalLRUStrategy = new LRUStorage({});

// @ts-ignore
import * as RedisMock from "ioredis-mock";
import { RedisIOStorage } from "../../storages/redisio/src/redisio.storage";

const MockedRedis = new RedisMock({
  host: "host",
  port: 123,
  password: "pass",
});
const canonicalRedisStrategy = new RedisIOStorage(() => MockedRedis);

class TestClassOne {
  callCount = 0;

  @MultiCache([canonicalLRUStrategy,canonicalRedisStrategy], 0, {
    getKey(
      _className: string,
      _methodName: string,
      parameter: any,
      args: any
    ): string {
      // args[1] = geoRegion
      return `{canonicalurl:${args[1].toUpperCase()}}:${parameter.pageType}:${
        parameter.path
      }:${process.env.NODE_ENV || "local"}`;
    },
  })
  public async getCanonicalUrlsFromCache(
    urls: { path: string; pageType: any }[],
    geoRegion: string
  ): Promise<string[]> {

    console.log("getCanonicalUrlsFromCache", urls, geoRegion);
    return urls.map((p) => {
      return p.path + "RETURN VALUE" + geoRegion
    });
  }
}

describe("MultiCacheDecorator", () => {
  beforeEach(async () => {
    // await storage.clear();
    // await storage2.clear();
  });

  it("Should multi cache", async () => {
    const myClass = new TestClassOne();
    // call 1
    const call1 = await myClass.getCanonicalUrlsFromCache(
      [
        { path: "elem1", pageType: "x" },
        { path: "elem2", pageType: "x" },
        { path: "elem3", pageType: "x" },
      ],
      "at"
    );
    console.log("CALL RESULT 1", call1);

    const call2 = await myClass.getCanonicalUrlsFromCache(
      [
        { path: "elem1", pageType: "x" },
         { path: "elem2", pageType: "x" },
         { path: "elem3", pageType: "x" },
      ],
      "at"
    );
    console.log("CALL RESULT 2", call2);
  });
});
