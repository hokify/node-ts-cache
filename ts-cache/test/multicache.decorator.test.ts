//import * as Assert from "assert";
import {MultiCache} from "../src/decorator/multicache.decorator";
import {LRUStorage} from "../../storages/lru/src/LRUStorage";
import {NodeCacheStorage} from "../../storages/node-cache/src/node-cache.storage";

const storage = new LRUStorage({});
const storage2 = new NodeCacheStorage({});

// const data = ["user", "max", "test"];

storage2.setItem('TestClassOne:cachedCall:"elem3":[["elem1","elem2","elem3"]]', 'STORAGE2');
storage.setItem('TestClassOne:cachedCall:"elem2":[["elem1","elem2","elem3"]]', 'STORAGE1');

class TestClassOne {
  callCount = 0;

  @MultiCache([storage, storage2], 0/*, {
    getKey(className: string, methodName: string, parameter: any, args: any): string {
      return 'canonical:' + parameter +
    }
  }*/)
  public cachedCall(param0: string[]): string[] {
    console.log('called with', param0);
    return param0.map(p => p + 'RETURN VALUE');
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
    const call1= await myClass.cachedCall(['elem1', 'elem2', 'elem3']);
    console.log('CALL1', call1);

    const call2= await myClass.cachedCall(['elem1', 'elem2', 'elem3']);
    console.log('CALL2', call2);
  });
});
