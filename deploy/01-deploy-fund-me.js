// import

// main function

// calling of main function

// function deployFunc(hre) {
//     console.log("abc")
// }
// module.exports.default = deployFunc

const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

// hre: hardhat runtime environment
// module.exports = async(hre) ==> {
//     const { getNamedAccounts, deployments } = hre
// }

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts() // deployer's account
    const chainId = network.config.chainId
    log(deployer)
    // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    //const address = "0x8a753747a1fa494ec906ce90e9f37563a8af630e"

    // when going for localhost or hardhat network, we want to use mock
    const args = [ethUsdPriceFeedAddress]
    log("Deploying fundme...")
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // put price feed address --> args of constructor function
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }
    log("======================================")
}

module.exports.tags = ["all", "fundme"]
