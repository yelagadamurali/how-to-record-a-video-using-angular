using static VideoRecordApp.Repositories.SASTokenRepository;

namespace VideoRecordApp.Repositories
{
    public interface ISASTokenRepository
    {
        Task<SASTokenDTO> AddSasToken();
    }
}
