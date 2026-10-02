using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SorobanToolkit.Services
{
    public class TokensBookService
    {
        private readonly Dictionary<string, List<TokenBalance>> _tokens = new();
        private readonly List<TokenTransaction> _transactions = new();

        public Task<List<TokenBalance>> GetBalancesAsync(string walletAddress)
        {
            var balances = _tokens.GetValueOrDefault(walletAddress, new List<TokenBalance>());
            return Task.FromResult(balances);
        }

        public Task<TokenBalance?> GetBalanceAsync(string walletAddress, string tokenId)
        {
            var balances = _tokens.GetValueOrDefault(walletAddress, new List<TokenBalance>());
            var balance = balances.FirstOrDefault(b => b.TokenId == tokenId);
            return Task.FromResult(balance);
        }

        public Task AddBalanceAsync(string walletAddress, TokenBalance balance)
        {
            if (!_tokens.ContainsKey(walletAddress))
                _tokens[walletAddress] = new List<TokenBalance>();

            var existing = _tokens[walletAddress].FindIndex(b => b.TokenId == balance.TokenId);
            if (existing >= 0)
                _tokens[walletAddress][existing] = balance;
            else
                _tokens[walletAddress].Add(balance);

            return Task.CompletedTask;
        }

        public Task RemoveBalanceAsync(string walletAddress, string tokenId)
        {
            if (_tokens.TryGetValue(walletAddress, out var balances))
                balances.RemoveAll(b => b.TokenId == tokenId);

            return Task.CompletedTask;
        }

        public Task AddTransactionAsync(TokenTransaction transaction)
        {
            _transactions.Add(transaction);
            return Task.CompletedTask;
        }

        public Task<List<TokenTransaction>> GetTransactionsAsync(string walletAddress)
        {
            var txs = _transactions
                .Where(t => t.WalletAddress == walletAddress)
                .ToList();
            return Task.FromResult(txs);
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

    public record TokenBalance
    {
        public string TokenId { get; init; } = string.Empty;
        public string Name { get; init; } = string.Empty;
        public string Symbol { get; init; } = string.Empty;
        public decimal Amount { get; init; }
        public int Decimals { get; init; }
    }

    public enum TransactionType
    {
        Transfer,
        Mint,
        Burn
    }

    public record TokenTransaction
    {
        public string Id { get; init; } = string.Empty;
        public string WalletAddress { get; init; } = string.Empty;
        public string TokenId { get; init; } = string.Empty;
        public TransactionType Type { get; init; }
        public decimal Amount { get; init; }
        public DateTime Timestamp { get; init; }
        public string? FromAddress { get; init; }
        public string? ToAddress { get; init; }
    }
}
