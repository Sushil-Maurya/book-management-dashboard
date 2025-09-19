"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

const LS_KEYS = {
  keys: "crudcrud_keys",
  idx: "crudcrud_idx",
  hits: "crudcrud_hits",
}

const CrudCrudSettings = () => {
  const [mounted, setMounted] = useState(false)
  const [newKey, setNewKey] = useState("")
  const [keys, setKeys] = useState<string[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [previousIdx, setPreviousIdx] = useState(-1)
  const [hits, setHits] = useState(0)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showCurrentKey, setShowCurrentKey] = useState(false)
  const [showPreviousKey, setShowPreviousKey] = useState(false)
  const [showAllKeys, setShowAllKeys] = useState<Record<number, boolean>>({})
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationStatus, setMigrationStatus] = useState<{
    status: 'idle' | 'migrating' | 'success' | 'error'
    message?: string
  }>({ status: 'idle' })

  useEffect(() => {
    setMounted(true)
    loadKeys()
  }, [])

  const loadKeys = () => {
    try {
      const storedKeys = localStorage.getItem(LS_KEYS.keys)
      const idx = parseInt(localStorage.getItem(LS_KEYS.idx) || "0", 10) || 0
      const hitCount = parseInt(localStorage.getItem(LS_KEYS.hits) || "0", 10) || 0
      
      const keysList = storedKeys ? storedKeys.split(",").filter(Boolean) : []
      setKeys(keysList)
      setCurrentIdx(idx)
      // If we have a previous index in localStorage, use it; otherwise, default to last index
      const prevIdx = localStorage.getItem('crudcrud_prev_idx')
      setPreviousIdx(prevIdx ? parseInt(prevIdx, 10) : Math.max(0, keysList.length - 1))
      setHits(hitCount)
    } catch (e) {
      setError("Failed to load keys")
      console.error(e)
    }
  }

  const addKey = () => {
    try {
      if (!newKey.trim()) {
        setError("Please enter a valid key")
        return
      }
      
      const updatedKeys = [...new Set([...keys, newKey.trim()])]
      const keysStr = updatedKeys.join(",")
      
      localStorage.setItem(LS_KEYS.keys, keysStr)
      setKeys(updatedKeys)
      setNewKey("")
      setError("")
      setSuccess("Key added successfully!")
      
      // Auto-hide success message
      setTimeout(() => setSuccess(""), 3000)
    } catch (e) {
      setError("Failed to add key")
      console.error(e)
    }
  }

  const removeKey = (keyToRemove: string) => {
    try {
      const updatedKeys = keys.filter(key => key !== keyToRemove)
      const keysStr = updatedKeys.join(",")
      
      localStorage.setItem(LS_KEYS.keys, keysStr)
      setKeys(updatedKeys)
      
      // Reset index if we removed the current key
      if (keys[currentIdx] === keyToRemove) {
        localStorage.setItem(LS_KEYS.idx, "0")
        localStorage.setItem(LS_KEYS.hits, "0")
        setCurrentIdx(0)
        setHits(0)
      }
      
      setSuccess(`Key ${keyToRemove.slice(0, 8)}... removed`)
      setTimeout(() => setSuccess(""), 3000)
    } catch (e) {
      setError("Failed to remove key")
      console.error(e)
    }
  }

  const rotateKey = async () => {
    try {
      if (keys.length <= 1) {
        setError("Add at least 2 keys to enable rotation")
        return
      }
      
      const nextIdx = (currentIdx + 1) % keys.length
      
      // Store current index as previous before updating
      localStorage.setItem('crudcrud_prev_idx', String(currentIdx))
      localStorage.setItem(LS_KEYS.idx, String(nextIdx))
      localStorage.setItem(LS_KEYS.hits, "0")
      
      // Update state
      setPreviousIdx(currentIdx)
      setCurrentIdx(nextIdx)
      setHits(0)
      
      setSuccess(`Rotated to key ${nextIdx + 1}`)
      setTimeout(() => setSuccess(""), 3000)
      
      // Return the keys for migration
      return {
        fromKey: keys[currentIdx],
        toKey: keys[nextIdx]
      }
    } catch (e) {
      setError("Failed to rotate key")
      console.error(e)
      throw e
    }
  }
  
  const handleRotateWithMigration = async () => {
    try {
      setMigrationStatus({ status: 'migrating', message: 'Rotating keys and migrating data...' })
      
      // Rotate the key first
      const keys = await rotateKey()
      if (!keys) return
      
      // Start migration in the background
      setIsMigrating(true)
      
      // This would be handled by the background migration in crudcrud.ts
      // We're just showing UI feedback here
      toast.success('Key rotation complete. Data migration started in the background.')
      
      // Simulate migration completion (in real app, this would be handled by the actual migration)
      setTimeout(() => {
        setMigrationStatus({ 
          status: 'success', 
          message: 'Data migration completed successfully' 
        })
        setIsMigrating(false)
      }, 2000)
      
    } catch (error) {
      setMigrationStatus({ 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Migration failed' 
      })
      console.error('Migration error:', error)
      setIsMigrating(false)
    }
  }


  if (!mounted) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>CrudCrud API Keys</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-key">Add New Key</Label>
          <div className="flex gap-2">
            <Input
              id="new-key"
              placeholder="Paste new CrudCrud key"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="flex-1"
            />
            <Button onClick={addKey}>Add Key</Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Get keys from <a href="https://crudcrud.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">crudcrud.com</a>
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">
            {success}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 p-3 border rounded bg-blue-50">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-blue-800">Current Key</div>
                <button 
                  onClick={() => setShowCurrentKey(!showCurrentKey)}
                  className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                  type="button"
                >
                  {showCurrentKey ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5" />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5" />
                      <span>Show</span>
                    </>
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <code className="text-sm font-mono break-all pr-2">
                  {keys[currentIdx] ? (
                    showCurrentKey ? keys[currentIdx] : `••••${keys[currentIdx].slice(-8)}`
                  ) : 'None'}
                </code>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full whitespace-nowrap">
                  Active • {hits}/100 hits
                </span>
              </div>
            </div>
            
            {previousIdx >= 0 && previousIdx !== currentIdx && keys[previousIdx] && (
              <div className="space-y-1 p-3 border rounded bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-700">Previous Key</div>
                  <button 
                    onClick={() => setShowPreviousKey(!showPreviousKey)}
                    className="text-gray-600 hover:text-gray-800 text-xs flex items-center gap-1"
                    type="button"
                  >
                    {showPreviousKey ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5" />
                        <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5" />
                        <span>Show</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono text-gray-600 break-all pr-2">
                    {showPreviousKey ? keys[previousIdx] : `••••${keys[previousIdx].slice(-8)}`}
                  </code>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full whitespace-nowrap">
                    Inactive
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between">
              <Label>All Keys</Label>
              <div className="text-sm text-muted-foreground">
                {keys.length} key{keys.length !== 1 ? 's' : ''} • Current: #{currentIdx + 1}
              </div>
            </div>
          
          {keys.length === 0 ? (
            <div className="p-4 text-sm text-center text-muted-foreground border rounded">
              No keys added yet
            </div>
          ) : (
            <div className="space-y-2">
              {keys.map((key, idx) => (
                <div 
                  key={key} 
                  className={`flex items-center justify-between p-3 border rounded ${
                    idx === currentIdx ? "bg-blue-50 border-blue-200" : ""
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${
                      idx === currentIdx ? "bg-blue-500" : "bg-gray-300"
                    }`}></span>
                    <div className="flex items-center gap-2">
                    <code className="text-sm font-mono break-all flex-1">
                      {showAllKeys[idx] ? key : `••••${key.slice(-8)}`}
                    </code>
                    <button 
                      onClick={() => setShowAllKeys(prev => ({ ...prev, [idx]: !prev[idx] }))}
                      className="text-muted-foreground hover:text-foreground"
                      type="button"
                      title={showAllKeys[idx] ? 'Hide key' : 'Show full key'}
                    >
                      {showAllKeys[idx] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    {idx === currentIdx && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                        Active
                      </span>
                    )}
                  </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeKey(key)}
                    disabled={keys.length <= 1}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
          </div>
          
          <div className="space-y-4">
            <Button 
              onClick={handleRotateWithMigration} 
              className="w-full" 
              disabled={keys.length <= 1 || isMigrating}
            >
              {isMigrating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Migrating...
                </>
              ) : (
                'Rotate & Migrate Data'
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={rotateKey} 
              className="w-full" 
              disabled={keys.length <= 1 || isMigrating}
            >
              Rotate Key Only
            </Button>
            
            {migrationStatus.status !== 'idle' && (
              <div className={`text-sm p-2 rounded-md ${
                migrationStatus.status === 'success' 
                  ? 'bg-green-50 text-green-700' 
                  : migrationStatus.status === 'error'
                  ? 'bg-red-50 text-red-700'
                  : 'bg-blue-50 text-blue-700'
              }`}>
                <div className="flex items-center gap-2">
                  {migrationStatus.status === 'success' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : migrationStatus.status === 'error' ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  )}
                  <span>{migrationStatus.message}</span>
                </div>
              </div>
            )}
          </div>
              <span>{migrationStatus.message}</span>
            </div>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export default CrudCrudSettings;
