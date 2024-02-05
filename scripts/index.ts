import type { EthereumProvider } from 'hardhat/types';
import type * as viemT from 'viem';

import viem from 'viem';
import { hardhat } from 'viem/chains';

import hre from 'hardhat';

type PublicClient = viemT.PublicClient<viemT.Transport, viemT.Chain>;
type WalletClient = viemT.WalletClient<viemT.Transport, viemT.Chain, viemT.Account>;

async function getPublicClient(provider: EthereumProvider): Promise<PublicClient> {
  const publicClient = viem.createPublicClient({
    chain: hardhat,
    transport: viem.custom(provider),
  });

  return publicClient;
}

async function getWalletClients(provider: EthereumProvider): Promise<WalletClient[]> {
  const accounts: viemT.Address[] = await provider.send('eth_accounts');

  const walletClients = accounts.map((account) =>
    viem.createWalletClient({
      chain: hardhat,
      account,
      transport: viem.custom(provider),
    })
  );

  return walletClients;
}

async function main() {
  const publicClient = await getPublicClient(hre.network.provider);
  const [fromWalletClient, toWalletClient] = await getWalletClients(hre.network.provider);

  const hash = await fromWalletClient.sendTransaction({
    to: toWalletClient.account.address,
    value: viem.parseEther('0.0001'),
  });
  // receipt has type any, but it should be a TransactionReceipt
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
