import { useState, useEffect } from "react"
import { Key, Plus, Trash2, Copy, Check, RefreshCw, AlertCircle, RotateCcw, Shield, Activity, Globe, Download, QrCode, Eye, EyeOff } from "lucide-react"

export default function ApiKeysPage({ api }) {
  const [keys, setKeys] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newKey, setNewKey] = useState(null)
  const [form, setForm] = useState({ name: "", scopes: ["email:read", "email:write", "mail:send"], rate_limit: 60, daily_limit: 200000 })
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [analytics, setAnalytics] = useState({})
  const [selectedKey, setSelectedKey] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await api("/v1/keys")
      setKeys(data.keys || [])
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  const loadAnalytics = async (keyId) => {
    try {
      const data = await api("/v1/analytics/usage?range=7d")
      setAnalytics(prev => ({ ...prev, [keyId]: data }))
    } catch (e) {}
  }

  useEffect(() => { load() }, [])

  const createKey = async (e) => {
    e.preventDefault()
    setError("")
    setCreating(true)
    try {
      const data = await api("/v1/keys/create", { 
        method: "POST", 
        body: JSON.stringify({
          name: form.name || "API Key",
          scopes: form.scopes,
          rate_limit_per_min: form.rate_limit,
          daily_limit: form.daily_limit
        })
      })
      setNewKey(data.api_key)
      setForm({ name: "", scopes: ["email:read", "email:write", "mail:send"], rate_limit: 60, daily_limit: 200000 })
      setShowCreate(false)
      load()
    } catch (e) { setError(e.message) }
    setCreating(false)
  }

  const deleteKey = async (id) => {
    if (!confirm("Revoke this API key permanently?")) return
    try {
      await api("/v1/keys/" + id, { method: "DELETE" })
      load()
    } catch (e) { setError(e.message) }
  }

  const rotateKey = async (id) => {
    if (!confirm("Rotate this key? The old key will stop working immediately.")) return
    try {
      const data = await api("/v1/keys/" + id + "/rotate", { method: "POST" })
      setNewKey(data.api_key)
      load()
    } catch (e) { setError(e.message) }
  }

  const copyKey = (key) => {
    navigator.clipboard.writeText(key || newKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadEnv = (key) => {
    const content = "# Temp Amit Brands API Key\\nTEMP_MAIL_API_KEY=" + key.key_prefix + "...\\n# Usage: X-API-Key header"
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = key.name.replace(/\\s+/g, "_") + ".env"
    a.click()
  }

  const SCOPES = [
    { id: "email:read", label: "Read Emails", desc: "List emails and messages" },
    { id: "email:write", label: "Create/Delete Emails", desc: "Create and delete temp addresses" },
    { id: "mail:send", label: "Send Mail", desc: "Send outbound emails" },
  ]

  return (
    <div className="page-container" data-testid="api-keys-page">
      <div className="page-header">
        <div>
          <h1><Key size={24}/> API Access Keys</h1>
          <p className="page-subtitle">Manage multiple API keys with scopes, rate limits, and IP restrictions.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn btn-primary" data-testid="create-key-btn">
          <Plus size={16}/> New Key
        </button>
      </div>

      {error && <div className="alert alert-error" data-testid="keys-error"><AlertCircle size={18}/>{error}</div>}

      {newKey && (
        <div className="alert alert-success" style={{flexDirection:"column",alignItems:"flex-start"}} data-testid="new-key-display">
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}><Check size={18}/><strong>Save this key now — it will not be shown again!</strong></div>
          <code style={{background:"#0f172a",padding:"12px 14px",borderRadius:8,wordBreak:"break-all",width:"100%",color:"#a5b4fc",fontFamily:"monospace"}}>{newKey}</code>
          <div style={{marginTop:12,display:"flex",gap:8}}>
            <button onClick={() => copyKey(newKey)} className="btn btn-primary btn-sm" data-testid="copy-new-key-btn">
              {copied ? <><Check size={14}/> Copied</> : <><Copy size={14}/> Copy</>}
            </button>
            <button onClick={() => setNewKey(null)} className="btn btn-ghost btn-sm">Dismiss</button>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} data-testid="create-key-modal">
            <h2>Create API Key</h2>
            <form onSubmit={createKey}>
              <div className="form-group">
                <label>Key Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Production API Key" className="input" data-testid="key-name-input"/>
              </div>
              <div className="form-group">
                <label>Scopes</label>
                <div className="scopes-grid">
                  {SCOPES.map(s => (
                    <label key={s.id} className="scope-checkbox">
                      <input 
                        type="checkbox" 
                        checked={form.scopes.includes(s.id)}
                        onChange={e => setForm({...form, scopes: e.target.checked ? [...form.scopes, s.id] : form.scopes.filter(x => x !== s.id)})}
                      />
                      <span>{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Rate Limit (per min)</label>
                  <input type="number" value={form.rate_limit} onChange={e => setForm({...form, rate_limit: +e.target.value})} className="input"/>
                </div>
                <div className="form-group">
                  <label>Daily Limit</label>
                  <input type="number" value={form.daily_limit} onChange={e => setForm({...form, daily_limit: +e.target.value})} className="input"/>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreate(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" disabled={creating} className="btn btn-primary" data-testid="submit-create-key">
                  {creating ? <><RefreshCw size={14} className="spin"/> Creating...</> : "Create Key"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading"><RefreshCw size={24} className="spin"/></div>
      ) : keys.length === 0 ? (
        <div className="empty-state" data-testid="no-keys">
          <Key size={48}/>
          <h3>No API Keys</h3>
          <p>Create your first API key to access the API programmatically.</p>
          <button onClick={() => setShowCreate(true)} className="btn btn-primary"><Plus size={16}/> Create Key</button>
        </div>
      ) : (
        <div className="keys-grid" data-testid="keys-list">
          {keys.map(k => (
            <div key={k.id} className={"key-card " + (k.status !== "active" ? "revoked" : "")} data-testid={"key-" + k.id}>
              <div className="key-header">
                <div className="key-name">
                  <Key size={18}/>
                  <strong>{k.name}</strong>
                  <span className={"status-badge " + k.status}>{k.status}</span>
                </div>
                <code className="key-prefix">{k.key_prefix}...</code>
              </div>
              <div className="key-meta">
                <div><Activity size={14}/> Rate: {k.rate_limit_per_min || 60}/min</div>
                <div><Globe size={14}/> Daily: {(k.daily_limit || 200000).toLocaleString()}</div>
              </div>
              <div className="key-scopes">
                {(k.scopes || []).map(s => <span key={s} className="scope-tag">{s}</span>)}
              </div>
              <div className="key-dates">
                <small>Created {new Date(k.created_at).toLocaleDateString()}</small>
                {k.last_used_at && <small>Last used {new Date(k.last_used_at).toLocaleString()}</small>}
              </div>
              <div className="key-actions">
                <button onClick={() => rotateKey(k.id)} className="btn btn-ghost btn-sm" title="Rotate Key"><RotateCcw size={14}/></button>
                <button onClick={() => downloadEnv(k)} className="btn btn-ghost btn-sm" title="Download .env"><Download size={14}/></button>
                <button onClick={() => deleteKey(k.id)} className="btn btn-danger btn-sm" title="Revoke"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="code-example" style={{marginTop:24}}>
        <h3>Usage Example</h3>
        <pre><code>{`curl -X GET "https://api.amitbrand.shop/api/v1/email/list" \\
  -H "X-API-Key: mtak_your_key_here"`}</code></pre>
      </div>
    </div>
  )
}
