import { useState, useEffect } from "react"
import { BarChart3, Activity, TrendingUp, AlertTriangle, RefreshCw, Globe, Clock } from "lucide-react"

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

  return (
    <div className="page-container" data-testid="analytics-page">
      <div className="page-header">
        <div>
          <h1><BarChart3 size={24}/> Analytics</h1>
          <p className="page-subtitle">Monitor your API usage and performance.</p>
        </div>
        <div className="range-selector">
          {["1h", "24h", "7d", "30d"].map(r => (
            <button key={r} onClick={() => setRange(r)} className={"btn btn-sm " + (range === r ? "btn-primary" : "btn-ghost")}>{r}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading"><RefreshCw size={24} className="spin"/></div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <Activity size={20}/>
              <div className="stat-value">{(usage.totals?.total_requests || 0).toLocaleString()}</div>
              <div className="stat-label">Total Requests</div>
            </div>
            <div className="stat-card">
              <TrendingUp size={20}/>
              <div className="stat-value">{(usage.totals?.total_tokens || 0).toLocaleString()}</div>
              <div className="stat-label">Tokens Consumed</div>
            </div>
            <div className="stat-card">
              <AlertTriangle size={20}/>
              <div className="stat-value">{errors.reduce((sum, e) => sum + (+e.count || 0), 0)}</div>
              <div className="stat-label">Errors</div>
            </div>
          </div>

          <div className="chart-section">
            <h3><Clock size={18}/> Usage Over Time</h3>
            <div className="simple-chart">
              {(usage.data || []).map((d, i) => (
                <div key={i} className="chart-bar-container">
                  <div className="chart-bar" style={{height: (d.requests / maxRequests * 100) + "%"}} title={d.requests + " requests"}></div>
                  <div className="chart-label">{new Date(d.period).toLocaleTimeString([], {hour: "2-digit"})}</div>
                </div>
              ))}
              {usage.data?.length === 0 && <div className="empty-chart">No data for this period</div>}
            </div>
          </div>

          <div className="two-col">
            <div className="chart-section">
              <h3><Globe size={18}/> Top Endpoints</h3>
              <div className="endpoints-list">
                {endpoints.slice(0, 10).map((ep, i) => (
                  <div key={i} className="endpoint-row">
                    <code>{ep.endpoint}</code>
                    <span className="endpoint-calls">{(+ep.calls).toLocaleString()} calls</span>
                  </div>
                ))}
                {endpoints.length === 0 && <div className="empty-state-small">No endpoint data</div>}
              </div>
            </div>

            <div className="chart-section">
              <h3><AlertTriangle size={18}/> Error Breakdown</h3>
              <div className="errors-list">
                {errors.map((e, i) => (
                  <div key={i} className="error-row">
                    <span className={"error-code " + (e.status_code >= 500 ? "error-5xx" : "error-4xx")}>HTTP {e.status_code}</span>
                    <span>{(+e.count).toLocaleString()} errors</span>
                  </div>
                ))}
                {errors.length === 0 && <div className="empty-state-small">No errors</div>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
