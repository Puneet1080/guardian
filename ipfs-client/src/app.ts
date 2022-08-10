import { ApplicationStates } from '@guardian/interfaces';
import { Web3Storage } from 'web3.storage';
import { MessageBrokerChannel, ApplicationState, Logger, DB_DI, DataBaseHelper, Migration, COMMON_CONNECTION_CONFIG } from '@guardian/common';
import { fileAPI } from './api/file.service';
import { Settings } from './entity/settings';
import { MikroORM } from '@mikro-orm/core';
import { MongoDriver } from '@mikro-orm/mongodb';

Promise.all([
    Migration({
        ...COMMON_CONNECTION_CONFIG,
        migrations: {
            path: 'dist/migrations',
            transactional: false
        }
    }),
    MikroORM.init<MongoDriver>({
        ...COMMON_CONNECTION_CONFIG,
        driverOptions: {
            useUnifiedTopology: true
        },
        ensureIndexes: true
    }),
    MessageBrokerChannel.connect('IPFS_CLIENT')
]).then(async values => {
    const [_, db, cn] = values;
    DB_DI.orm = db;
    const state = new ApplicationState('IPFS_CLIENT');
    const channel = new MessageBrokerChannel(cn, 'ipfs-client');

    new Logger().setChannel(channel);
    state.setChannel(channel);

    // Check configuration
    if (!process.env.NFT_API_KEY || process.env.NFT_API_KEY.length < 20) {
        await new Logger().error('You need to fill NFT_API_KEY field in .env file', ['IPFS_CLIENT']);
        throw new Error('You need to fill NFT_API_KEY field in .env file');
    }
    ///////////////

    state.updateState(ApplicationStates.STARTED);
    const settingsRepository = new DataBaseHelper(Settings);
    const nftApiKey = await settingsRepository.findOne({
        name: 'NFT_API_KEY'
    });

    state.updateState(ApplicationStates.INITIALIZING);
    await fileAPI(channel, new Web3Storage({ token: nftApiKey?.value || process.env.NFT_API_KEY } as any), settingsRepository);

    state.updateState(ApplicationStates.READY);
    new Logger().info('ipfs-client service started', ['IPFS_CLIENT']);
})
