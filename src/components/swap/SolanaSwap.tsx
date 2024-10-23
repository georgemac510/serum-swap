// components/swap/SolanaSwap.tsx
'use client';

import { FC, useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

interface Token {
  symbol: string;
  name: string;
  mint: PublicKey;
  decimals: number;
  balance?: number;
}

const TOKENS: Token[] = [
  {
    symbol: 'SOL',
    name: 'Solana',
    mint: new PublicKey('So11111111111111111111111111111111111111112'),
    decimals: 9
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    mint: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
    decimals: 6
  }
];

export const SolanaSwap: FC = () => {
  const { connection } = useConnection();
  const { connected, publicKey } = useWallet();
  const [fromToken, setFromToken] = useState<string>('');
  const [toToken, setToToken] = useState<string>('');
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [tokenBalances, setTokenBalances] = useState<{[key: string]: number}>({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch balances when wallet is connected
  useEffect(() => {
    if (connected && publicKey) {
      fetchBalances();
    } else {
      setTokenBalances({});
    }
  }, [connected, publicKey, connection]);

  const fetchBalances = async () => {
    if (!publicKey) return;
    
    setIsLoading(true);
    try {
      // Fetch SOL balance
      const solBalance = await connection.getBalance(publicKey);
      const balances: {[key: string]: number} = {
        SOL: solBalance / LAMPORTS_PER_SOL
      };

      // Fetch SPL token balances
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: TOKEN_PROGRAM_ID }
      );

      tokenAccounts.value.forEach((tokenAccount) => {
        const accountData = tokenAccount.account.data.parsed.info;
        const mint = accountData.mint;
        const token = TOKENS.find(t => t.mint.toString() === mint);
        if (token) {
          balances[token.symbol] = Number(accountData.tokenAmount.uiAmount);
        }
      });

      setTokenBalances(balances);
    } catch (error) {
      console.error('Error fetching balances:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwap = async () => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!fromToken || !toToken || !fromAmount) {
      alert('Please fill in all fields');
      return;
    }

    // Check if user has sufficient balance
    const balance = tokenBalances[fromToken] || 0;
    if (Number(fromAmount) > balance) {
      alert(`Insufficient ${fromToken} balance`);
      return;
    }

    console.log('Swap initiated:', { fromToken, toToken, fromAmount, toAmount });
    // We'll implement actual swap logic in the next step
  };

  const getBalanceForToken = (symbol: string) => {
    const balance = tokenBalances[symbol];
    return balance !== undefined ? balance.toFixed(4) : '0';
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded-lg shadow-lg">
      <div className="mb-4 flex justify-center">
        <WalletMultiButton />
      </div>

      {isLoading && (
        <div className="text-center mb-4">Loading balances...</div>
      )}

      <div className="space-y-4">
        {/* From Token Section */}
        <div>
          <label className="block text-sm font-medium mb-2">From</label>
          <div className="flex gap-2">
            <select
              className="border rounded p-2 w-32"
              value={fromToken}
              onChange={(e) => setFromToken(e.target.value)}
            >
              <option value="">Select token</option>
              {TOKENS.map(token => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol}
                </option>
              ))}
            </select>
            <input
              type="text"
              className="border rounded p-2 flex-1"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
            />
          </div>
          {fromToken && (
            <div className="text-sm text-gray-600 mt-1">
              Balance: {getBalanceForToken(fromToken)} {fromToken}
            </div>
          )}
        </div>

        {/* Switch Arrow */}
        <div className="flex justify-center">
          <button
            className="p-2 border rounded-full"
            onClick={() => {
              setFromToken(toToken);
              setToToken(fromToken);
              setFromAmount(toAmount);
              setToAmount(fromAmount);
            }}
          >
            ↕️
          </button>
        </div>

        {/* To Token Section */}
        <div>
          <label className="block text-sm font-medium mb-2">To</label>
          <div className="flex gap-2">
            <select
              className="border rounded p-2 w-32"
              value={toToken}
              onChange={(e) => setToToken(e.target.value)}
            >
              <option value="">Select token</option>
              {TOKENS.map(token => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol}
                </option>
              ))}
            </select>
            <input
              type="text"
              className="border rounded p-2 flex-1"
              placeholder="0.0"
              value={toAmount}
              onChange={(e) => setToAmount(e.target.value)}
            />
          </div>
          {toToken && (
            <div className="text-sm text-gray-600 mt-1">
              Balance: {getBalanceForToken(toToken)} {toToken}
            </div>
          )}
        </div>

        {/* Swap Button */}
        <button
          className="w-full bg-blue-500 text-white p-2 rounded disabled:opacity-50"
          onClick={handleSwap}
          disabled={!connected || !fromToken || !toToken || !fromAmount || isLoading}
        >
          {!connected ? 'Connect Wallet' : isLoading ? 'Loading...' : 'Swap'}
        </button>
      </div>
    </div>
  );
};

export default SolanaSwap;