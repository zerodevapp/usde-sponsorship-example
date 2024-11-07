import "dotenv/config"
import {
    createKernelAccount,
    createZeroDevPaymasterClient,
    createKernelAccountClient,
    getERC20PaymasterApproveCall,
    ZeroDevPaymasterClient
} from "@zerodev/sdk"
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator"
import {
    ENTRYPOINT_ADDRESS_V07,
    bundlerActions
} from "permissionless"
import {
    http,
    Hex,
    createPublicClient,
    zeroAddress,
    parseEther,
    defineChain
} from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { EntryPoint } from "permissionless/types"
import { KERNEL_V3_1 } from "@zerodev/sdk/constants"

if (
    !process.env.BUNDLER_RPC ||
    !process.env.PAYMASTER_RPC ||
    !process.env.PRIVATE_KEY
) {
    throw new Error("BUNDLER_RPC or PAYMASTER_RPC or PRIVATE_KEY is not set")
}
const usdeAddress = "0x426E7d03f9803Dd11cb8616C65b99a3c0AfeA6dE"

const chain = defineChain({
    id: 52085143,
    name: "Ethena",
    nativeCurrency: {
        decimals: 18,
        name: "Ether",
        symbol: "ETH"
    },
    rpcUrls: {
        default: {
            http: ["https://rpc-ethena-testnet-0.t.conduit.xyz"]
        }
    },
    blockExplorers: {
        default: {
            name: "Explorer",
            url: "https://explorer-ethena-testnet-0.t.conduit.xyz"
        }
    }
})
const publicClient = createPublicClient({
    transport: http(process.env.BUNDLER_RPC),
    chain
})

const signer = privateKeyToAccount(process.env.PRIVATE_KEY as Hex)
const entryPoint = ENTRYPOINT_ADDRESS_V07

const main = async () => {
    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
        entryPoint,
        signer,
        kernelVersion: KERNEL_V3_1
    })

    const account = await createKernelAccount(publicClient, {
        entryPoint,
        plugins: {
            sudo: ecdsaValidator
        },
        kernelVersion: KERNEL_V3_1,
        useMetaFactory: false
    })

    const action = process.argv[2]; // Get the action from command-line arguments

    if (action === "getAddress") {
        console.log("My account address:", account.address);
        return;
    }

    if (action === "sendTransaction") {
        const paymasterClient = createZeroDevPaymasterClient({
            chain,
            entryPoint,
            transport: http(process.env.PAYMASTER_RPC)
        })

        const kernelClient = createKernelAccountClient({
            entryPoint,
            account,
            chain,
            bundlerTransport: http(process.env.BUNDLER_RPC),
            middleware: {
                sponsorUserOperation: async ({ userOperation }) => {
                    return paymasterClient.sponsorUserOperation({
                        userOperation,
                        entryPoint,
                        gasToken: usdeAddress
                    })
                }
            }
        })

        console.log("Gas token address", usdeAddress)

        const userOpHash = await kernelClient.sendUserOperation({
            userOperation: {
                callData: await account.encodeCallData([
                    await getERC20PaymasterApproveCall(
                        paymasterClient as ZeroDevPaymasterClient<EntryPoint>,
                        {
                            gasToken: usdeAddress,
                            approveAmount: parseEther("1"),
                            entryPoint
                        }
                    ),
                    {
                        to: zeroAddress,
                        value: BigInt(0),
                        data: "0x"
                    }
                ])
            }
        })

        console.log("UserOp hash:", userOpHash)

        const bundlerClient = kernelClient.extend(bundlerActions(entryPoint))
        const userOp = await bundlerClient.waitForUserOperationReceipt({
            hash: userOpHash,
            timeout: 1000000
        })
        console.log(`https://explorer-ethena-testnet-0.t.conduit.xyz/tx/${userOp.receipt.transactionHash}`)
        console.log("UserOp completed")
    } else {
        console.log("Invalid action. Use 'getAddress' or 'sendTransaction'.");
    }
}

main()