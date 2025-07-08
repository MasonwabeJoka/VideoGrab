# Proxy Setup Guide for VideoGrab

## Why Use Proxies?

YouTube and other video platforms may block IP addresses from cloud hosting providers (like DigitalOcean, AWS, etc.) when they detect automated downloads. Using proxies helps avoid these blocks by rotating through different IP addresses.

## Configuration

### 1. Environment Variables

Copy `.env.example` to `.env` and configure your proxy settings:

```bash
cp .env.example .env
```

### 2. Proxy List Configuration

Set the `PROXY_LIST` environment variable with comma-separated proxy URLs:

```env
PROXY_LIST=http://proxy1.example.com:8080,http://proxy2.example.com:8080,socks5://proxy3.example.com:1080
```

### 3. Supported Proxy Formats

- HTTP: `http://host:port`
- HTTPS: `https://host:port`
- SOCKS5: `socks5://host:port`
- With authentication: `http://username:password@host:port`

## Recommended Proxy Services

### Residential Proxies (Most Effective)
1. **Bright Data** - Premium residential proxies
2. **Oxylabs** - High-quality residential IPs
3. **SmartProxy** - Affordable residential proxies
4. **NetNut** - Fast residential network

### Datacenter Proxies (Budget Option)
1. **ProxyMesh** - Rotating datacenter proxies
2. **Storm Proxies** - Affordable rotating proxies
3. **MyPrivateProxy** - Dedicated datacenter proxies

## Rate Limiting

The system includes built-in rate limiting to avoid overwhelming servers:

- Default: 2 seconds between requests
- Configurable via `MIN_REQUEST_INTERVAL` environment variable

## Testing Your Setup

1. Set up your proxy configuration
2. Try downloading a video
3. Check the logs for proxy usage confirmation
4. Monitor for any blocking issues

## Troubleshooting

### Common Issues

1. **Proxy Connection Failed**
   - Verify proxy credentials and endpoints
   - Check if proxy service is active
   - Test proxy connectivity manually

2. **Still Getting Blocked**
   - Try residential proxies instead of datacenter
   - Increase rate limiting interval
   - Update cookies.txt file

3. **Slow Downloads**
   - Some proxies may be slower than direct connection
   - Try different proxy providers
   - Consider premium proxy services

### Logs

Monitor the application logs for proxy usage:
```
Using proxy: http://proxy1.example.com:8080
Rate limiting: waiting 2000ms before next request
```

## Security Notes

- Never commit proxy credentials to version control
- Use environment variables for sensitive information
- Regularly rotate proxy credentials
- Monitor proxy usage and costs

## Cost Considerations

- Residential proxies: $50-200/month for moderate usage
- Datacenter proxies: $10-50/month
- Free proxies: Not recommended for production use

Choose based on your usage volume and blocking severity.
