var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import gql from "graphql-tag";
import { ethers } from "ethers";
import IPFSClient from "ipfs-http-client";
const stateBuilder = {
    getInitialState() {
        return {
            myValue: 0,
            myFlag: false
        };
    },
    reducers: {
        "CUSTOM_EVENT": (state, payload) => __awaiter(void 0, void 0, void 0, function* () {
            state.myValue = payload.myValue;
            return state;
        })
    }
};
function queryUserGravatar(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const { client } = context;
        const { ethereum } = context.graph.config;
        return yield client.query({
            query: gql `
      query GetGravatars {
        gravatars (where: {owner: "${ethereum.provider.selectedAddress}"}) {
          id
          owner
          displayName
          imageUrl
        }
      }`
        });
    });
}
function sendTx(tx, state) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield state.sendEvent("TRANSACTION_CREATED", { id: tx.hash, description: tx.data }, 20);
            tx = yield tx;
            yield state.sendEvent("TRANSACTION_COMPLETED", { id: tx.hash, description: tx.data }, 60);
            return tx;
        }
        catch (error) {
            yield state.sendEvent('TRANSACTION_ERROR', error, 60);
        }
    });
}
function getGravityContract(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const { ethereum } = context.graph.config;
        const abi = yield context.graph.dataSources.Gravity.abi;
        const address = yield context.graph.dataSources.Gravity.address;
        const contract = new ethers.Contract(address, abi, ethereum.getSigner());
        contract.connect(ethereum);
        return contract;
    });
}
function createGravatar(_root, { options }, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const { displayName, imageUrl } = options;
        const gravity = yield getGravityContract(context);
        const state = context.state;
        yield sendTx(gravity.createGravatar(displayName, imageUrl), state);
        const { data } = yield queryUserGravatar(context);
        return data.gravatars[0];
    });
}
function updateGravatarName(_root, { displayName }, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const gravity = yield getGravityContract(context);
        const state = context.graph.state;
        yield sleep(2000);
        if (context.fail)
            throw new Error("Transaction Errored (Controlled Error Test Case)");
        const txResult = yield sendTx(gravity.updateGravatarName(displayName), state);
        if (!txResult)
            throw new Error("WHOLE PROCESS FAILED");
        yield state.sendEvent("CUSTOM_EVENT", { myValue: 999 }, 100);
        const { data } = yield queryUserGravatar(context);
        return data.gravatars[0];
    });
}
function updateGravatarImage(_root, { imageUrl }, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const gravity = yield getGravityContract(context);
        const state = context.state;
        yield sendTx(gravity.updateGravatarImage(imageUrl), state);
        const { data } = yield queryUserGravatar(context);
        return data.gravatars[0];
    });
}
const resolvers = {
    Mutation: {
        createGravatar,
        updateGravatarName,
        updateGravatarImage
    }
};
const config = {
    ethereum: (provider) => {
        return new ethers.providers.Web3Provider(provider);
    },
    ipfs: (provider) => {
        const url = new URL(provider);
        return IPFSClient({
            protocol: url.protocol.replace(/[:]+$/, ''),
            host: url.hostname,
            port: url.port,
            'api-path': url.pathname.replace(/\/$/, '') + '/api/v0/',
        });
    },
    // Example of a custom configuration property
    property: {
        // Property setters can be nested
        a: (value) => { },
        b: (value) => { }
    }
};
export default {
    resolvers,
    config,
    stateBuilder
};
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
