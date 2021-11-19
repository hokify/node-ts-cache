import * as Assert from 'assert';
import RedisStorage from '../src/index.js';
import Bluebird from 'bluebird';

// @ts-ignore
import RedisMock from 'redis-mock';
Bluebird.promisifyAll(RedisMock.RedisClient.prototype);
Bluebird.promisifyAll(RedisMock.Multi.prototype);

const storage = new RedisStorage(
	{
		host: 'host',
		port: 123,
		password: 'pass'
	},
	RedisMock
);


describe('RedisStorage', () => {
	it('Should clear Redis without errors', async () => {
		await storage.clear();
	});

    /*
	it('Should delete cache item if set to undefined', async () => {
		await storage.setItem('test', undefined);

		Assert.strictEqual(clientMock.delAsync.called, true);
		Assert.strictEqual(clientMock.delAsync.calledWith('test'), true);
		Assert.strictEqual(clientMock.setItem.called, false);
	});*/

	it('Should return undefined if cache not hit', async () => {
		// await storage.clear();
		const item = await storage.getItem('item123');

		Assert.strictEqual(item, undefined);
	});

	it.skip('Should throw an Error if connection to redis fails', async () => {
		const testStorage = new RedisStorage({
			host: 'unknown-host',
			port: 123,
			password: 'pass',
			connect_timeout: 1000
		}, RedisMock);

		const errorMsg = 'Should have thrown an error, but did not';
		try {
			await testStorage.clear();
			await Promise.reject(errorMsg);
		} catch (error) {
			if (error === errorMsg) {
				Assert.fail('It id not throw an error');
			} else {
				Assert.ok(true);
			}
		}
	});
});
