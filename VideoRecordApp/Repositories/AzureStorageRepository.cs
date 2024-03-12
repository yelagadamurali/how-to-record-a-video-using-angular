using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Specialized;
using Azure.Storage.Sas;

namespace VideoRecordApp.Repositories
{
    public class AzureStorageRepository : IAzureStorageRepository
    {
        private readonly IConfiguration _configuration;
        private readonly string _storageConnectionString;
        public AzureStorageRepository(IConfiguration configuration)
        {
            _storageConnectionString = configuration["StorageConfig:ConnectionString"];
            _configuration = configuration;
        }
        public async Task<BlobContainerClient> GetBlobContainerClient(string blobContainerName)
        {
            // Create a BlobServiceClient object which will be used to create a container client
            BlobServiceClient blobServiceClient = new BlobServiceClient(_storageConnectionString);
            //return a container client object
            BlobContainerClient containerClient = blobServiceClient.GetBlobContainerClient(blobContainerName);
            if (containerClient is null)
                throw new ArgumentNullException(message: nameof(BlobContainerClient) + " is null", null);
            return await Task.FromResult(containerClient);
        }
        public async Task<BlobClient> GetBlobClient(BlobContainerClient blobContainerClient, string blobName)
        {
            // Get a reference to a blob
            BlobClient blobClient = blobContainerClient.GetBlobClient(blobName);
            return await Task.FromResult(blobClient);
        }

        public async Task<Azure.Storage.Blobs.Models.BlobContentInfo> UploadBlobStream(BlobContainerClient blobContainerClient, Stream stream, string blobName)
        {
            // Get a reference to a blob
            BlobClient blobClient = await GetBlobClient(blobContainerClient, blobName);
            //upload
            Azure.Response<Azure.Storage.Blobs.Models.BlobContentInfo> response = await blobClient.UploadAsync(stream, true);
            return response.Value;
        }
        public async Task<Uri> GetServiceSasUriForContainer(BlobContainerClient containerClient, string storedPolicyName = null)
        {
            // Check whether this BlobContainerClient object has been authorized with Shared Key.
            if (containerClient.CanGenerateSasUri)
            {
                // Create a SAS token that's valid for one hour.
                BlobSasBuilder sasBuilder = new BlobSasBuilder()
                {
                    BlobContainerName = containerClient.Name,
                    Resource = "c"
                };

                if (storedPolicyName == null)
                {
                    sasBuilder.ExpiresOn = DateTimeOffset.UtcNow.AddDays(9);
                    sasBuilder.SetPermissions(BlobContainerSasPermissions.Write | BlobContainerSasPermissions.Read);
                }
                else
                {
                    sasBuilder.Identifier = storedPolicyName;
                }

                Uri sasUri = containerClient.GenerateSasUri(sasBuilder);
                //Console.WriteLine("SAS URI for blob container is: {0}", sasUri);
                //Console.WriteLine();
                return await Task.FromResult(sasUri);
            }
            else
            {
                Console.WriteLine(@"BlobContainerClient must be authorized with Shared Key 
                          credentials to create a service SAS.");
                return null;
            }
        }
        public async Task<Uri> GetServiceSasUriForBlob(BlobClient blobClient, string storedPolicyName = null)
        {
            // Check whether this BlobClient object has been authorized with Shared Key.
            if (blobClient.CanGenerateSasUri)
            {
                // Create a SAS token that's valid for one hour.
                BlobSasBuilder sasBuilder = new BlobSasBuilder()
                {
                    BlobContainerName = blobClient.GetParentBlobContainerClient().Name,
                    BlobName = blobClient.Name,
                    Resource = "b"
                };

                if (storedPolicyName == null)
                {
                    sasBuilder.ExpiresOn = DateTimeOffset.UtcNow.AddHours(9);
                    sasBuilder.SetPermissions(BlobSasPermissions.Read |
                        BlobSasPermissions.Write);
                }
                else
                {
                    sasBuilder.Identifier = storedPolicyName;
                }
                Uri sasUri = blobClient.GenerateSasUri(sasBuilder);
                Console.WriteLine("SAS URI for blob is: {0}", sasUri);
                Console.WriteLine();
                return await Task.FromResult(sasUri);
            }
            else
            {
                Console.WriteLine(@"BlobClient must be authorized with Shared Key 
                          credentials to create a service SAS.");
                return null;
            }
        }
    }
}

