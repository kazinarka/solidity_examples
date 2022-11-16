const testnet_router = "0xD99D1c33F9fC3444f8101754aBC46c52416550D1";
const testnet_factory = "0x6725F303b657a9451d8BA641348b6761A6CC7a17";
const mainnet_router = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
const mainnet_factory = "0xca143ce32fe78f1f7019d7d551a6402fc5350c73";

enum Network {
    Testnet,
    Mainnet
}

function router_factory(network: Network): [string, string] {
    switch (network) {
        case Network.Testnet:
            return [testnet_router, testnet_factory];
        case Network.Mainnet:
            return [mainnet_router, mainnet_factory];
    }

}
export {
    Network,
    router_factory
}
