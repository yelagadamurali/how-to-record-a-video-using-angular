using Azure.Storage.Blobs;

namespace VideoRecordApp.Repositories
{
    public interface IAzureStorageRepository
    {
        Task<BlobContainerClient> GetBlobContainerClient(string blobContainerName);
        Task<BlobClient> GetBlobClient(BlobContainerClient blobContainerClient, string blobName);
        Task<Azure.Storage.Blobs.Models.BlobContentInfo> UploadBlobStream(BlobContainerClient blobContainerClient, Stream stream, string blobName);
        Task<Uri> GetServiceSasUriForContainer(BlobContainerClient containerClient, string storedPolicyName = null);
        Task<Uri> GetServiceSasUriForBlob(BlobClient blobClient, string storedPolicyName = null);
    }
}
