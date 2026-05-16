import { useState, useEffect } from "react"
import { BarChart3, Activity, TrendingUp, AlertTriangle, RefreshCw, Globe, Clock, Zap, Target, ArrowUp, ArrowDown, LineChart } from "lucide-react"

export default function AnalyticsPage({ api }) {
  const [range, setRange] = useState("24h")
  const [usage, setUsage] = useState({ data: [], totals: {} })
  const [endpoints, setEndpoints] = useState([])
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [u, e, er] = await Promise.all([
        api("/v1/analytics/usage?range=" + range),
        api("/v1/analytics/endpoints"),
        api("/v1/analytics/errors")
      ])
      setUsage(u)
      setEndpoints(e.endpoints || [])
      setErrors(er.errors || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [range])

  const maxRequests = Math.max(...(usage.data || []).map(d => +d.requests || 0), 1)
  const maxTokens = Math.max(...(usage.data || []).map(d => +d.tokens || 0), 1)
  
  // Calculate trend
  const dataPoints = usage.data || []
  const currentPeriod = dataPoints.slice(-Math.floor(dataPoints.length / 2))
  const previousPeriod = dataPoints.slice(0, Math.floor(dataPoints.length / 2))
  const currentSum = currentPeriod.reduce((sum, d) => sum + (+d.requests || 0), 0)
  const previousSum = previousPeriod.reduce((sum, d) => sum + (+d.requests || 0), 0)
  const trend = previousSum > 0 ? ((currentSum - previousSum) / previousSum * 100).toFixed(1) : 0
  const trendUp = currentSum >= previousSum

  const formatTime = (period) => {
    const d = new Date(period)
    if (range === "1h" || range === "24h") {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
    return d.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  // Calculate Y-axis scale
  const yAxisSteps = 5
  const yAxisValues = Array.from({ length: yAxisSteps + 1 }, (_, i) => Math.round(maxRequests * (yAxisSteps - i) / yAxisSteps))

  return (
    <div className="analytics-container" data-testid="analytics-page">
      {/* Header */}
      <div className="analytics-header">
        <div className="analytics-title-section">
          <h1 className="analytics-title">
            <BarChart3 className="analytics-title-icon" size={28}/>
            Analytics Dashboard
          </h1>
          <p className="analytics-subtitle">Monitor your API performance and usage patterns</p>
        </div>
        
        <div className="analytics-controls">
          <div className="range-buttons">
            {["1h", "24h", "7d", "30d"].map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={"range-btn " + (range === r ? "range-btn-active" : "")}
              >
                {r}
              </button>
            ))}
          </div>
          <button onClick={load} className="refresh-btn" disabled={loading}>
            <RefreshCw size={18} className={loading ? "spin" : ""}/>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="analytics-loading">
          <RefreshCw size={32} className="spin"/>
          <span>Loading analytics...</span>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="stats-cards">
            <div className="stat-card stat-card-primary">
              <div className="stat-card-header">
                <div className="stat-icon stat-icon-blue">
                  <Activity size={20}/>
                </div>
                <div className={"stat-trend " + (trendUp ? "trend-up" : "trend-down")}>
                  {trendUp ? <ArrowUp size={14}/> : <ArrowDown size={14}/>}
                  {Math.abs(trend)}%
                </div>
              </div>
              <div className="stat-value">{(usage.totals?.total_requests || 0).toLocaleString()}</div>
              <div className="stat-label">Total Requests ({range})</div>
              <div className="stat-sublabel">vs previous period</div>
            </div>
            
            <div className="stat-card stat-card-secondary">
              <div className="stat-card-header">
                <div className="stat-icon stat-icon-purple">
                  <Zap size={20}/>
                </div>
              </div>
              <div className="stat-value">{(usage.totals?.total_tokens || 0).toLocaleString()}</div>
              <div className="stat-label">Tokens Consumed</div>
              <div className="stat-sublabel">API operations cost</div>
            </div>
            
            <div className="stat-card stat-card-tertiary">
              <div className="stat-card-header">
                <div className="stat-icon stat-icon-green">
                  <Target size={20}/>
                </div>
              </div>
              <div className="stat-value">
                {usage.totals?.total_requests > 0 
                  ? ((1 - errors.reduce((sum, e) => sum + (+e.count || 0), 0) / usage.totals.total_requests) * 100).toFixed(1) 
                  : 100}%
              </div>
              <div className="stat-label">Success Rate</div>
              <div className="stat-sublabel">Request completion</div>
            </div>
            
            <div className="stat-card stat-card-warning">
              <div className="stat-card-header">
                <div className="stat-icon stat-icon-red">
                  <AlertTriangle size={20}/>
                </div>
              </div>
              <div className="stat-value">{errors.reduce((sum, e) => sum + (+e.count || 0), 0)}</div>
              <div className="stat-label">Total Errors</div>
              <div className="stat-sublabel">Failed requests</div>
            </div>
          </div>

          {/* Main Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <div className="chart-title">
                <LineChart size={20}/>
                <span>Usage Over Time</span>
              </div>
              <div className="chart-legend">
                <div className="legend-item">
                  <span className="legend-dot legend-dot-blue"></span>
                  Requests
                </div>
                <div className="legend-item">
                  <span className="legend-dot legend-dot-purple"></span>
                  Tokens
                </div>
              </div>
            </div>
            
            <div className="chart-container">
              {/* Y-Axis */}
              <div className="chart-y-axis">
                {yAxisValues.map((val, i) => (
                  <div key={i} className="y-axis-label">{val.toLocaleString()}</div>
                ))}
              </div>
              
              {/* Chart Area */}
              <div className="chart-area">
                {/* Grid lines */}
                <div className="chart-grid">
                  {yAxisValues.map((_, i) => (
                    <div key={i} className="grid-line"></div>
                  ))}
                </div>
                
                {/* Bars */}
                <div className="chart-bars">
                  {(usage.data || []).map((d, i) => (
                    <div key={i} className="bar-group">
                      <div className="bar-wrapper">
                        <div 
                          className="bar bar-requests" 
                          style={{height: Math.max((d.requests / maxRequests * 100), 2) + "%"}}
                          title={d.requests + " requests"}
                        >
                          <span className="bar-tooltip">{d.requests} requests</span>
                        </div>
                        <div 
                          className="bar bar-tokens" 
                          style={{height: Math.max((d.tokens / maxTokens * 100), 2) + "%"}}
                          title={d.tokens + " tokens"}
                        >
                          <span className="bar-tooltip">{d.tokens} tokens</span>
                        </div>
                      </div>
                      <div className="bar-label">{formatTime(d.period)}</div>
                    </div>
                  ))}
                </div>
                
                {usage.data?.length === 0 && (
                  <div className="empty-chart">
                    <BarChart3 size={48} className="empty-icon"/>
                    <span>No data available for this period</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="bottom-section">
            {/* Top Endpoints */}
            <div className="endpoints-card">
              <div className="card-header">
                <Globe size={20}/>
                <span>Top Endpoints</span>
              </div>
              <div className="endpoints-list">
                {endpoints.slice(0, 8).map((ep, i) => {
                  const percentage = endpoints.length > 0 ? (+ep.calls / endpoints.reduce((sum, e) => sum + +e.calls, 0) * 100).toFixed(1) : 0
                  return (
                    <div key={i} className="endpoint-item">
                      <div className="endpoint-info">
                        <span className="endpoint-rank">#{i + 1}</span>
                        <code className="endpoint-path">{ep.endpoint}</code>
                      </div>
                      <div className="endpoint-stats">
                        <div className="endpoint-bar-bg">
                          <div className="endpoint-bar" style={{width: percentage + "%"}}></div>
                        </div>
                        <span className="endpoint-calls">{(+ep.calls).toLocaleString()}</span>
                      </div>
                    </div>
                  )
                })}
                {endpoints.length === 0 && (
                  <div className="empty-state-mini">
                    <Globe size={24}/>
                    <span>No endpoint data yet</span>
                  </div>
                )}
              </div>
            </div>

            {/* Error Breakdown */}
            <div className="errors-card">
              <div className="card-header">
                <AlertTriangle size={20}/>
                <span>Error Breakdown</span>
              </div>
              <div className="errors-list">
                {errors.map((e, i) => (
                  <div key={i} className="error-item">
                    <div className="error-info">
                      <span className={"error-badge " + (+e.status_code >= 500 ? "error-5xx" : "error-4xx")}>
                        {e.status_code}
                      </span>
                      <span className="error-desc">
                        {+e.status_code === 400 && "Bad Request"}
                        {+e.status_code === 401 && "Unauthorized"}
                        {+e.status_code === 403 && "Forbidden"}
                        {+e.status_code === 404 && "Not Found"}
                        {+e.status_code === 429 && "Rate Limited"}
                        {+e.status_code >= 500 && "Server Error"}
                      </span>
                    </div>
                    <span className="error-count">{(+e.count).toLocaleString()}</span>
                  </div>
                ))}
                {errors.length === 0 && (
                  <div className="empty-state-mini success-state">
                    <Target size={24}/>
                    <span>No errors! Great job!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
