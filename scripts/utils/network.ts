const bsc_testnet_router = "0xD99D1c33F9fC3444f8101754aBC46c52416550D1";
const bsc_testnet_factory = "0x6725F303b657a9451d8BA641348b6761A6CC7a17";
const bsc_mainnet_router = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
const bsc_mainnet_factory = "0xca143ce32fe78f1f7019d7d551a6402fc5350c73";
const eth_mainnet_router = "0xEfF92A263d31888d860bD50809A8D171709b7b1c";
const eth_mainnet_factory = "0x1097053Fd2ea711dad45caCcc45EfF7548fCB362";

enum Network {
    BSC_Testnet,
    BSC_Mainnet,
    ETH_Mainnet
}

function router_factory(network: Network): [string, string] {
    switch (network) {
        case Network.BSC_Testnet:
            return [bsc_testnet_router, bsc_testnet_factory];
        case Network.BSC_Mainnet:
            return [bsc_mainnet_router, bsc_mainnet_factory];
        case Network.ETH_Mainnet:
            return [eth_mainnet_router, eth_mainnet_factory];
    }

}

export {
    Network,
    router_factory
}
