using Microsoft.Extensions.DependencyInjection;
using SorobanToolkit.Services;
using SorobanToolkit.Temp;

namespace SorobanToolkit
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddSorobanToolkit(this IServiceCollection services)
        {
            services.AddScoped<ITokensBookService, TokensBookMockup>();
            return services;
        }
    }
}
