import * as Assert from "assert";
import RedisIOStorage from "../src/index.js";
import * as snappy from "snappy";

// @ts-ignore
import RedisMock from "ioredis-mock";

const MockedRedis = new RedisMock({
  host: "host",
  port: 123,
  password: "pass",
});

const storage = new RedisIOStorage(() => MockedRedis);
const compressedStorage = new RedisIOStorage(() => MockedRedis, {
  maxAge: 86400,
  compress: true,
});

describe("RedisIOStorage", () => {
  it("Should clear Redis without errors", async () => {
    await storage.clear();
  });

  describe("undefined handled correctly", () => {
    it("Should delete cache item if set to undefined", async () => {
      await storage.setItem("test", undefined);

      Assert.strictEqual(await storage.getItem("test"), undefined);
    });

    it("Should return undefined if cache not hit", async () => {
      await storage.clear();
      const item = await storage.getItem("item123");

      Assert.strictEqual(item, undefined);
    });
  });

  describe("compression", () => {
    it("Should set and retrieve item correclty", async () => {
      await compressedStorage.setItem("test", { asdf: 1 });

      Assert.deepEqual(
        await MockedRedis.get("test"),
        snappy.compressSync(JSON.stringify({ asdf: 1 }))
      );

      Assert.deepEqual(await compressedStorage.getItem("test"), { asdf: 1 });
    });

    it("Mutli Should set and retrieve item correclty", async () => {
      await compressedStorage.setItems([
        { key: "test", content: { asdf: 2 } },
        { key: "test2", content: "2" },
      ]);

      Assert.deepEqual(
        await MockedRedis.get("test"),
        snappy.compressSync(JSON.stringify({ asdf: 2 }))
      );
      Assert.deepEqual(
        await MockedRedis.get("test2"),
        snappy.compressSync(JSON.stringify("2"))
      );

      Assert.deepEqual(await compressedStorage.getItem("test"), { asdf: 2 });
      Assert.deepEqual(await compressedStorage.getItem("test2"), "2");
    });
  });

  describe("uncompressed", () => {
    it("Should set and retrieve item correclty", async () => {
      await storage.setItem("test", { asdf: 2 });

      Assert.deepEqual(
        await MockedRedis.get("test"),
        JSON.stringify({ asdf: 2 })
      );

      Assert.deepEqual(await storage.getItem("test"), { asdf: 2 });
    });

    it("Mutli Should set and retrieve item correclty", async () => {
      await storage.setItems([
        { key: "test", content: { asdf: 2 } },
        { key: "test2", content: "2" },
      ]);

      Assert.deepEqual(
        await MockedRedis.get("test"),
        JSON.stringify({ asdf: 2 })
      );
      Assert.deepEqual(await MockedRedis.get("test2"), JSON.stringify("2"));

      Assert.deepEqual(await storage.getItem("test"), { asdf: 2 });
      Assert.deepEqual(await storage.getItem("test2"), "2");
    });
  });
});
