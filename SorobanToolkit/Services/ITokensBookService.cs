using System.Collections.Generic;
using System.Threading.Tasks;

namespace SorobanToolkit.Services
{
    public interface ITokensBookService
    {
        Task<List<TokenBalance>> GetBalancesAsync(string walletAddress);
        Task<TokenBalance?> GetBalanceAsync(string walletAddress, string tokenId);
        Task AddBalanceAsync(string walletAddress, TokenBalance balance);
        Task RemoveBalanceAsync(string walletAddress, string tokenId);
        Task AddTransactionAsync(TokenTransaction transaction);
        Task<List<TokenTransaction>> GetTransactionsAsync(string walletAddress);
        void SeedMockData();
    }
}
