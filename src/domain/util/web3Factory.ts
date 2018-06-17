import * as config from "config";
import { LoggerService } from "../../app";
import { GasPriceSubProvider } from "./gasPriceSubProvider";
import { SignerSubProvider } from "./signerSubProvider";

const ProviderEngine = require("web3-provider-engine");
const WalletSubprovider = require("web3-provider-engine/subproviders/wallet.js");
const FilterSubprovider = require("web3-provider-engine/subproviders/filters.js");
const CacheSubprovider = require("web3-provider-engine/subproviders/cache.js");
const ethereumjsWallet = require("ethereumjs-wallet");
const RpcSubprovider = require("web3-provider-engine/subproviders/rpc");
const FixtureProvider = require("web3-provider-engine/subproviders/fixture.js");
const NonceTrackerSubprovider = require("web3-provider-engine/subproviders/nonce-tracker.js");
const Web3 = require("web3");

export class Web3Factory {
    private static readonly providerUrl = config.get("amadeus.infuraUrl") as string;

    public createWeb3(privateKey: string, loggerService: LoggerService): any {
        Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;

        const engine = new ProviderEngine();
        engine.addProvider(new FixtureProvider({
            eth_hashrate: "0x00",
            eth_mining: false,
            net_listening: true,
        }));
        engine.addProvider(new CacheSubprovider());
        engine.addProvider(new FilterSubprovider());
        engine.addProvider(new NonceTrackerSubprovider());
        engine.addProvider(new SignerSubProvider(privateKey, loggerService));
        // engine.addProvider(new GasPriceSubProvider());
        engine.addProvider(new WalletSubprovider(this.getWallet(privateKey), {}));
        engine.addProvider(new RpcSubprovider({
            rpcUrl: Web3Factory.providerUrl,
        }));
        engine.start();

        return new Web3(engine);
    }

    private getWallet(privateKey: string): any {
        return ethereumjsWallet.fromPrivateKey(new Buffer(privateKey, "hex"));
    }

    private extend(source: any, target: any): any {
        for (const key in source) {
            if (Object.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }

        return target;
    }

}
