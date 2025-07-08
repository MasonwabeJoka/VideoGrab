"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Server, Download, Clock, Shield } from "lucide-react";

interface SystemStatus {
  proxy: {
    total: number;
    current: number;
    configured: boolean;
  };
  downloads: {
    active: number;
    maxConcurrent: number;
  };
  rateLimit: {
    interval: number;
  };
  timestamp: string;
}

export default function AdminPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/status");
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.data);
        setError(null);
      } else {
        setError(data.error || "Failed to fetch status");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading && !status) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">System Administration</h1>
        <Button onClick={fetchStatus} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {status && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Proxy Status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Proxy Status</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Configured:</span>
                  <Badge variant={status.proxy.configured ? "default" : "destructive"}>
                    {status.proxy.configured ? "Yes" : "No"}
                  </Badge>
                </div>
                {status.proxy.configured && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Proxies:</span>
                      <span className="font-medium">{status.proxy.total}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Current Index:</span>
                      <span className="font-medium">{status.proxy.current}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Download Status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Downloads</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active:</span>
                  <Badge variant={status.downloads.active > 0 ? "default" : "secondary"}>
                    {status.downloads.active}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Max Concurrent:</span>
                  <span className="font-medium">{status.downloads.maxConcurrent}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${(status.downloads.active / status.downloads.maxConcurrent) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rate Limiting */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rate Limiting</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Interval:</span>
                  <span className="font-medium">{status.rateLimit.interval}ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Per Hour:</span>
                  <span className="font-medium">
                    ~{Math.floor(3600000 / status.rateLimit.interval)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Info */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status:</span>
                  <Badge variant="default">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Update:</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(status.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Configuration Help */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Proxy Configuration</h4>
            <p className="text-sm text-muted-foreground mb-2">
              To configure proxies, set the PROXY_LIST environment variable:
            </p>
            <code className="block bg-gray-100 p-2 rounded text-sm">
              PROXY_LIST=http://proxy1.example.com:8080,http://proxy2.example.com:8080
            </code>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Rate Limiting</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Adjust the minimum interval between requests:
            </p>
            <code className="block bg-gray-100 p-2 rounded text-sm">
              MIN_REQUEST_INTERVAL=2000
            </code>
          </div>

          <div>
            <h4 className="font-medium mb-2">Concurrent Downloads</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Set the maximum number of concurrent downloads:
            </p>
            <code className="block bg-gray-100 p-2 rounded text-sm">
              MAX_CONCURRENT_DOWNLOADS=3
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
