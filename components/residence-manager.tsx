"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Home, Pencil, Save, X, CheckCircle2, Trash2, Plus } from "lucide-react"
import { updateResidence, deleteResidence, addResidence } from "@/app/actions/auth-actions"

interface Residence {
  id: string
  address: string
  street_name: string
  last_name: string
  is_claimed: boolean
}

interface ResidenceManagerProps {
  residences: Residence[]
}

export default function ResidenceManager({ residences }: ResidenceManagerProps) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [addingToStreet, setAddingToStreet] = useState<string | null>(null)
  const [newAddress, setNewAddress] = useState("")
  const [newLastName, setNewLastName] = useState("")

  const handleEdit = (residence: Residence) => {
    setEditingId(residence.id)
    setEditValue(residence.last_name)
    setError("")
    setSuccess("")
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditValue("")
  }

  const handleSave = async (residenceId: string) => {
    if (!editValue.trim()) {
      setError("Name cannot be empty")
      return
    }
    
    setIsSaving(true)
    setError("")
    try {
      await updateResidence(residenceId, editValue)
      setSuccess("Homeowner name updated successfully!")
      setEditingId(null)
      setEditValue("")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to update residence")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (residenceId: string) => {
    if (!confirm("Are you sure you want to delete this address? This action cannot be undone.")) {
      return
    }

    setDeletingId(residenceId)
    setError("")
    setSuccess("")

    try {
      await deleteResidence(residenceId)
      setSuccess("Address deleted successfully!")
      router.refresh()
    } catch (err: any) {
      console.error("[v0] Delete residence error:", err)
      setError(err.message || "Failed to delete address")
    } finally {
      setDeletingId(null)
    }
  }

  const streets = ["Symor Dr", "Brothers Pl", "Fanok Rd", "Hadley Way", "Herms Pl"]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="w-5 h-5" />
          Residence Management
        </CardTitle>
        <CardDescription>
          Edit homeowner names for each address. Click the pencil icon to edit.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded">
            {success}
          </div>
        )}

        <div className="space-y-6">
          {streets.map((street) => {
            const streetResidences = residences.filter((r) => r.street_name === street)
            if (streetResidences.length === 0) return null

            return (
              <div key={street} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-lg border-b pb-2 flex-1">{street}</h4>
                  {street === "Fanok Rd" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAddingToStreet(street)}
                      className="ml-2"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  )}
                </div>
                <div className="grid gap-2">
                  {streetResidences.map((residence) => (
                    <div
                      key={residence.id}
                      className={`flex items-center justify-between p-3 rounded border ${
                        residence.is_claimed ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="font-medium min-w-[120px]">{residence.address}</div>
                        
                        {editingId === residence.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="max-w-[200px]"
                              placeholder="Enter homeowner name"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSave(residence.id)
                                if (e.key === "Escape") handleCancel()
                              }}
                            />
                            <Button
                              size="sm"
                              onClick={() => handleSave(residence.id)}
                              disabled={isSaving}
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancel}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {residence.is_claimed && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                            <span className="text-slate-700">{residence.last_name}</span>
                          </div>
                        )}
                      </div>
                      
                      {editingId !== residence.id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(residence)}
                          className="text-slate-600 hover:text-slate-800"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      )}
                      {editingId !== residence.id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(residence.id)}
                          disabled={deletingId === residence.id}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {addingToStreet === street && (
                  <div className="p-4 border-2 border-dashed rounded bg-blue-50">
                    <div className="space-y-3">
                      <h5 className="font-medium text-sm">Add new address to {street}</h5>
                      <div className="flex gap-2">
                        <Input
                          value={newAddress}
                          onChange={(e) => setNewAddress(e.target.value)}
                          placeholder="e.g., 5 Fanok Rd"
                          className="flex-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newLastName}
                          onChange={(e) => setNewLastName(e.target.value)}
                          placeholder="Homeowner last name"
                          className="flex-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={async () => {
                            if (!newAddress.trim() || !newLastName.trim()) {
                              setError("Please fill in all fields")
                              return
                            }
                            
                            try {
                              await addResidence(newAddress, street, newLastName)
                              setSuccess(`Address added successfully!`)
                              setAddingToStreet(null)
                              setNewAddress("")
                              setNewLastName("")
                              router.refresh()
                            } catch (err: any) {
                              setError(err.message || "Failed to add address")
                            }
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setAddingToStreet(null)
                            setNewAddress("")
                            setNewLastName("")
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {residence.is_claimed && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                            <span className="text-slate-700">{residence.last_name}</span>
                          </div>
                        )}
                      </div>
                      
                      {editingId !== residence.id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(residence)}
                          className="text-slate-600 hover:text-slate-800"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      )}
                      {editingId !== residence.id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(residence.id)}
                          disabled={deletingId === residence.id}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
