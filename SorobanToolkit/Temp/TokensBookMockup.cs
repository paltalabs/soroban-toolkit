using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SorobanToolkit.Services;

namespace SorobanToolkit.Temp
{
    /// <summary>
    /// Mockup tokens book implementation for local development and testing.
    /// This provides an in-memory store of token balances and transactions.
    /// </summary>
    public class TokensBookMockup : ITokensBookService
    {
        private readonly Dictionary<string, List<TokenBalance>> _tokens = new();
        private readonly List<TokenTransaction> _transactions = new();

        public async Task<List<TokenBalance>> GetBalancesAsync(string walletAddress)
        {
            var balances = _tokens.GetValueOrDefault(walletAddress, new List<TokenBalance>());
            return await Task.FromResult(balances);
        }

        public async Task<TokenBalance?> GetBalanceAsync(string walletAddress, string tokenId)
        {
            var balances = _tokens.GetValueOrDefault(walletAddress, new List<TokenBalance>());
            var balance = balances.FirstOrDefault(b => b.TokenId == tokenId);
            return await Task.FromResult(balance);
        }

        public async Task AddBalanceAsync(string walletAddress, TokenBalance balance)
        {
            if (!_tokens.ContainsKey(walletAddress))
                _tokens[walletAddress] = new List<TokenBalance>();

            var existing = _tokens[walletAddress].FindIndex(b => b.TokenId == balance.TokenId);
            if (existing >= 0)
                _tokens[walletAddress][existing] = balance;
            else
                _tokens[walletAddress].Add(balance);

            await Task.CompletedTask;
        }

        public async Task RemoveBalanceAsync(string walletAddress, string tokenId)
        {
            if (_tokens.TryGetValue(walletAddress, out var balances))
                balances.RemoveAll(b => b.TokenId == tokenId);

            await Task.CompletedTask;
        }

        public async Task AddTransactionAsync(TokenTransaction transaction)
        {
            _transactions.Add(transaction);
            await Task.CompletedTask;
        }

        public async Task<List<TokenTransaction>> GetTransactionsAsync(string walletAddress)
        {
            var txs = _transactions
                .Where(t => t.WalletAddress == walletAddress)
                .ToList();
            return await Task.FromResult(txs);
        }

        public void SeedMockData()
        {
            _tokens["0xabc123"] = new List<TokenBalance>
            {
                new TokenBalance { TokenId = "USDC", Name = "USD Coin", Symbol = "USDC", Amount = 1000m, Decimals = 6 },
                new TokenBalance { TokenId = "ETH", Name = "Ethereum", Symbol = "ETH", Amount = 5m, Decimals = 18 },
            };

            _tokens["0xdef456"] = new List<TokenBalance>
            {
                new TokenBalance { TokenId = "DAI", Name = "Dai", Symbol = "DAI", Amount = 500m, Decimals = 18 },
            };

            _transactions.Add(new TokenTransaction
            {
                Id = Guid.NewGuid().ToString(),
                WalletAddress = "0xabc123",
                TokenId = "USDC",
                Type = TransactionType.Transfer,
                Amount = 100m,
                Timestamp = DateTime.UtcNow,
                FromAddress = "0xabc123",
                ToAddress = "0xdef456",
            });
        }
    }
}
