using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Specialized;
using Azure.Storage.Sas;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VideoRecordApp.Repositories;
using static VideoRecordApp.Repositories.SASTokenRepository;

namespace VideoRecordApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SASTokenAPIController : ControllerBase
    {
        private readonly ISASTokenRepository _asaTokenRepository;
        public SASTokenAPIController(ISASTokenRepository asaTokenRepository)
        {
            _asaTokenRepository = asaTokenRepository;
        }

        [HttpPost]
        [Route("AddSasToken")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<SASTokenDTO>> AddSasToken()
        {
            try
            {
                var data = await _asaTokenRepository.AddSasToken();
                return Ok(data);
            }
            catch
            {
                return BadRequest();
            }
        }
    }
}



