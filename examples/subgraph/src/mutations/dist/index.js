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
function queryUserGravatar(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const { client } = context;
        const { ethereum } = context.thegraph.config;
        return yield client.query(gql `
  {
    gravatar(owner: ${ethereum.eth.defaultAccount}) {
      id
      owner
      displayName
      imageUrl
    }
  }`);
    });
}
function sendTx(tx, msg, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const { mutationState } = context.thegraph;
        try {
            tx = yield tx;
            mutationState.addTransaction(tx.hash);
            yield tx.wait();
        }
        catch (error) {
            mutationState.addError(error);
            throw new Error(`Failed while sending "${msg}"`);
        }
    });
}
function getGravityContract(context) {
    const { ethereum } = context.thegraph.config;
    const { Gravity } = context.thegraph.dataSources;
    const contract = new ethers.Contract(Gravity.address, Gravity.abi, ethereum);
    contract.connect(ethereum);
    return contract;
}
function createGravatar(_root, { options }, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const { displayName, imageUrl } = options;
        const gravity = getGravityContract(context);
        const tx = gravity.createGravatar(displayName, imageUrl);
        yield sendTx(tx, "Creating Gravatar", context);
        return yield queryUserGravatar(context);
    });
}
function updateGravatarName(_root, { displayName }, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const gravity = getGravityContract(context);
        const tx = gravity.updateGravatarName(displayName);
        yield sendTx(tx, "Updating Gravatar Name", context);
        return yield queryUserGravatar(context);
    });
}
function updateGravatarImage(_root, { imageUrl }, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const gravity = getGravityContract(context);
        const tx = gravity.updateGravatarImage(imageUrl);
        // Example of custom data within the state
        context.thegraph.mutationState.addData("imageUrl", imageUrl);
        yield sendTx(tx, "Updating Gravatar Image", context);
        return yield queryUserGravatar(context);
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
    config
};
