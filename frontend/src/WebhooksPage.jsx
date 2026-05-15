import { useState, useEffect } from "react"
import { Webhook, Plus, Trash2, Play, AlertCircle, Check, RefreshCw, Globe } from "lucide-react"

export default function WebhooksPage({ api }) {
  const [webhooks, setWebhooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newSecret, setNewSecret] = useState(null)
  const [form, setForm] = useState({ url: "", events: ["message.received"] })
  const [error, setError] = useState("")
  const [testing, setTesting] = useState(null)

  const EVENTS = [
    { id: "message.received", label: "Message Received" },
    { id: "message.read", label: "Message Read" },
    { id: "email.created", label: "Email Created" },
    { id: "email.deleted", label: "Email Deleted" },
  ]

  const load = async () => {
    setLoading(true)
    try {
      const data = await api("/v1/webhooks")
      setWebhooks(data.webhooks || [])
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const createWebhook = async (e) => {
    e.preventDefault()
    if (!form.url) return setError("URL required")
    setError("")
    setCreating(true)
    try {
      const data = await api("/v1/webhooks", { method: "POST", body: JSON.stringify(form) })
      setNewSecret(data.secret)
      setForm({ url: "", events: ["message.received"] })
      setShowCreate(false)
      load()
    } catch (e) { setError(e.message) }
    setCreating(false)
  }

  const deleteWebhook = async (id) => {
    if (!confirm("Delete this webhook?")) return
    try {
      await api("/v1/webhooks/" + id, { method: "DELETE" })
      load()
    } catch (e) { setError(e.message) }
  }

  const testWebhook = async (id) => {
    setTesting(id)
    try {
      const data = await api("/v1/webhooks/" + id + "/test", { method: "POST" })
      alert("Test delivered! Status: " + data.status_code)
    } catch (e) { setError(e.message) }
    setTesting(null)
    load()
  }

  return (
    <div className="page-container" data-testid="webhooks-page">
      <div className="page-header">
        <div>
          <h1><Webhook size={24}/> Webhooks</h1>
          <p className="page-subtitle">Receive real-time notifications when events occur.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn btn-primary">
          <Plus size={16}/> New Webhook
        </button>
      </div>

      {error && <div className="alert alert-error"><AlertCircle size={18}/>{error}</div>}

      {newSecret && (
        <div className="alert alert-success" style={{flexDirection:"column",alignItems:"flex-start"}}>
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}><Check size={18}/><strong>Save this secret for signature verification!</strong></div>
          <code style={{background:"#0f172a",padding:"12px",borderRadius:8,wordBreak:"break-all",width:"100%",color:"#a5b4fc"}}>{newSecret}</code>
          <button onClick={() => setNewSecret(null)} className="btn btn-ghost btn-sm" style={{marginTop:8}}>Dismiss</button>
        </div>
      )}

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Create Webhook</h2>
            <form onSubmit={createWebhook}>
              <div className="form-group">
                <label>Webhook URL</label>
                <input value={form.url} onChange={e => setForm({...form, url: e.target.value})} placeholder="https://your-server.com/webhook" className="input"/>
              </div>
              <div className="form-group">
                <label>Events</label>
                <div className="scopes-grid">
                  {EVENTS.map(ev => (
                    <label key={ev.id} className="scope-checkbox">
                      <input 
                        type="checkbox" 
                        checked={form.events.includes(ev.id)}
                        onChange={e => setForm({...form, events: e.target.checked ? [...form.events, ev.id] : form.events.filter(x => x !== ev.id)})}
                      />
                      <span>{ev.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreate(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" disabled={creating} className="btn btn-primary">
                  {creating ? "Creating..." : "Create Webhook"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading"><RefreshCw size={24} className="spin"/></div>
      ) : webhooks.length === 0 ? (
        <div className="empty-state">
          <Webhook size={48}/>
          <h3>No Webhooks</h3>
          <p>Create a webhook to receive event notifications.</p>
        </div>
      ) : (
        <div className="webhooks-list">
          {webhooks.map(wh => (
            <div key={wh.id} className="webhook-card">
              <div className="webhook-header">
                <Globe size={18}/>
                <code className="webhook-url">{wh.url}</code>
                <span className={"status-badge " + wh.status}>{wh.status}</span>
              </div>
              <div className="webhook-events">
                {(wh.events || []).map(e => <span key={e} className="scope-tag">{e}</span>)}
              </div>
              <div className="webhook-meta">
                {wh.last_delivery_at && <small>Last delivery: {new Date(wh.last_delivery_at).toLocaleString()} (HTTP {wh.last_status_code})</small>}
              </div>
              <div className="webhook-actions">
                <button onClick={() => testWebhook(wh.id)} disabled={testing === wh.id} className="btn btn-ghost btn-sm">
                  {testing === wh.id ? <RefreshCw size={14} className="spin"/> : <Play size={14}/>} Test
                </button>
                <button onClick={() => deleteWebhook(wh.id)} className="btn btn-danger btn-sm"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="code-example" style={{marginTop:24}}>
        <h3>Signature Verification (Node.js)</h3>
        <pre><code>{`const crypto = require(crypto);
const signature = req.headers[x-signature];
const expected = crypto.createHmac(sha256, YOUR_SECRET)
  .update(JSON.stringify(req.body)).digest(hex);
if (signature !== expected) throw new Error(Invalid signature);`}</code></pre>
      </div>
    </div>
  )
}
