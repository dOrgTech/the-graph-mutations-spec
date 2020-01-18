import { ethers } from "ethers";
import { EventPayload, StateBuilder, FullState } from "@graphprotocol/mutations-ts";
interface CustomEvent extends EventPayload {
    myValue: number;
}
declare type EventMap = {
    'CUSTOM_EVENT': CustomEvent;
};
interface CustomState {
    myValue: number;
    myFlag: boolean;
}
declare function createGravatar(_root: any, { options }: any, context: any): Promise<any>;
declare function updateGravatarName(_root: any, { displayName }: any, context: any): Promise<any>;
declare function updateGravatarImage(_root: any, { imageUrl }: any, context: any): Promise<any>;
export declare type State = FullState<CustomState>;
declare const _default: {
    resolvers: {
        Mutation: {
            createGravatar: typeof createGravatar;
            updateGravatarName: typeof updateGravatarName;
            updateGravatarImage: typeof updateGravatarImage;
        };
    };
    config: {
        ethereum: (provider: any) => ethers.providers.Web3Provider;
        ipfs: (provider: string) => any;
        property: {
            a: (value: string) => void;
            b: (value: string) => void;
        };
    };
    stateBuilder: StateBuilder<CustomState, EventMap>;
};
export default _default;
