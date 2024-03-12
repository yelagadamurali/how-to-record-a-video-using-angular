namespace VideoRecordApp.Repositories
{
    public class SASTokenRepository : ISASTokenRepository
    {
        private readonly IConfiguration _configuration;
        private readonly IAzureStorageRepository _azureStorageRepository;
        public SASTokenRepository(IConfiguration configuration, IAzureStorageRepository azureStorageRepository)
        {
            _configuration = configuration;
            _azureStorageRepository = azureStorageRepository;
        }
        public async Task<SASTokenDTO> AddSasToken()
        {
            SASTokenDTO tokenWithGuid = new SASTokenDTO();
            tokenWithGuid.Guid = Guid.NewGuid().ToString();
            var blobContainer = await _azureStorageRepository.GetBlobContainerClient(_configuration.GetSection("StorageConfig")["ContainerName"]);
            var sasToken = await _azureStorageRepository.GetServiceSasUriForContainer(blobContainer);
            tokenWithGuid.SasToken = sasToken.AbsoluteUri;
            return tokenWithGuid;
        }
        public class SASTokenDTO
        {
            public string Guid { get; set; }
            public string SasToken { get; set; }
        }
    }
}
