# DigitalOcean Deployment Guide - YouTube Blocking Fix

## 🚨 Critical Issue: YouTube IP Blocking

YouTube actively blocks requests from DigitalOcean and other cloud hosting providers. This guide provides the **required steps** to resolve the "YouTube blocked request: server IP is blocked" error.

## ✅ Required Solutions (Choose One or Both)

### Option 1: Configure Residential Proxies (Recommended)

**Why needed**: DigitalOcean IPs are flagged by YouTube as datacenter IPs.

1. **Get Residential Proxy Service**:
   - **Bright Data**: Most reliable, $50-100/month
   - **Oxylabs**: High quality, $60-120/month  
   - **SmartProxy**: Budget option, $40-80/month

2. **Set Environment Variables on DigitalOcean**:
   ```bash
   # In your DigitalOcean App Platform or Droplet
   export PROXY_LIST="http://username:password@residential-proxy1.com:8080,http://username:password@residential-proxy2.com:8080"
   export MIN_REQUEST_INTERVAL=3000
   export MAX_CONCURRENT_DOWNLOADS=2
   ```

3. **For App Platform**:
   - Go to your app settings
   - Add environment variables in the "Environment Variables" section
   - Redeploy the app

4. **For Droplets**:
   ```bash
   # Add to your .env file or export directly
   echo "PROXY_LIST=your-proxy-list-here" >> .env
   docker-compose down && docker-compose up -d
   ```

### Option 2: Update YouTube Cookies (Temporary Fix)

**Why needed**: Fresh cookies from a logged-in session can temporarily bypass blocking.

1. **Export Fresh Cookies**:
   - Install browser extension: "Get cookies.txt LOCALLY"
   - Visit youtube.com and log in
   - Export cookies for youtube.com
   - Copy the content

2. **Update cookies.txt on Server**:
   ```bash
   # SSH into your DigitalOcean server
   ssh root@your-server-ip
   
   # Navigate to your app directory
   cd /path/to/your/app
   
   # Backup old cookies
   cp cookies.txt cookies.txt.backup
   
   # Update with fresh cookies (paste your exported content)
   nano cookies.txt
   
   # Restart application
   docker-compose restart  # or pm2 restart app
   ```

## 🔧 Implementation Steps

### Step 1: Check Current Status

Visit your admin dashboard to check proxy configuration:
```
https://videoboom.online/admin
```

### Step 2: Configure Proxies (Primary Solution)

**For DigitalOcean App Platform**:
1. Go to DigitalOcean Console
2. Select your app
3. Go to Settings → Environment Variables
4. Add:
   ```
   PROXY_LIST = http://user:pass@proxy1.com:8080,http://user:pass@proxy2.com:8080
   MIN_REQUEST_INTERVAL = 3000
   MAX_CONCURRENT_DOWNLOADS = 2
   ```
5. Click "Save" and redeploy

**For DigitalOcean Droplet**:
```bash
# Create/update .env file
cat > .env << EOF
PROXY_LIST=http://username:password@proxy1.example.com:8080,http://username:password@proxy2.example.com:8080
MIN_REQUEST_INTERVAL=3000
MAX_CONCURRENT_DOWNLOADS=2
EOF

# Restart your application
docker-compose down && docker-compose up -d
# OR
pm2 restart all
```

### Step 3: Update Cookies (Secondary Solution)

1. **Get Fresh Cookies**:
   - Use "Get cookies.txt LOCALLY" browser extension
   - Visit youtube.com, log in
   - Export cookies for youtube.com domain

2. **Update on Server**:
   ```bash
   # Replace cookies.txt with fresh content
   # Then restart application
   ```

### Step 4: Test the Fix

1. Try downloading a video from your site
2. Check logs for proxy usage confirmation
3. Monitor admin dashboard for success rates

## 🛠 Troubleshooting

### Still Getting Blocked?

1. **Verify Proxy Configuration**:
   ```bash
   # Check environment variables
   echo $PROXY_LIST
   
   # Check admin dashboard
   curl https://videoboom.online/api/status
   ```

2. **Try Different Proxy Types**:
   - Switch from HTTP to SOCKS5 proxies
   - Use residential instead of datacenter proxies
   - Rotate proxy providers

3. **Update Rate Limiting**:
   ```bash
   # Increase delays between requests
   export MIN_REQUEST_INTERVAL=5000
   ```

### Proxy Connection Issues?

1. **Test Proxy Manually**:
   ```bash
   curl --proxy http://username:password@proxy.com:8080 https://httpbin.org/ip
   ```

2. **Check Proxy Credentials**:
   - Verify username/password
   - Check proxy server status
   - Test with proxy provider's test endpoints

### Performance Issues?

1. **Reduce Concurrent Downloads**:
   ```bash
   export MAX_CONCURRENT_DOWNLOADS=1
   ```

2. **Increase Rate Limiting**:
   ```bash
   export MIN_REQUEST_INTERVAL=5000
   ```

## 💰 Cost Estimates

### Proxy Services (Monthly)
- **Bright Data**: $50-150 (most reliable)
- **Oxylabs**: $60-120 (high quality)
- **SmartProxy**: $40-80 (budget option)
- **ProxyMesh**: $10-30 (datacenter, less reliable)

### DigitalOcean Costs
- App Platform: $5-25/month
- Droplet: $5-20/month
- **Total with proxies**: $55-175/month

## 🚀 Quick Fix Commands

**Emergency proxy setup** (replace with your proxy details):
```bash
# Set environment variables
export PROXY_LIST="http://user:pass@proxy.com:8080"
export MIN_REQUEST_INTERVAL=3000

# Restart app
docker-compose restart
# OR
pm2 restart all

# Test
curl https://videoboom.online/api/status
```

## 📞 Support

If you continue experiencing issues:

1. Check proxy provider documentation
2. Test proxies with curl commands
3. Monitor application logs for specific error messages
4. Consider switching proxy providers if blocking persists

**Remember**: YouTube actively fights automated downloads. Residential proxies are currently the most effective solution for cloud hosting providers like DigitalOcean.
