"use client"

import { useState } from "react"
import { addMember, removeMember } from "@/actions/projects"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Loader2, UserX, Mail } from "lucide-react"
import { toast } from "sonner"

interface MemberListProps {
  members: {
    id: string
    role: string
    user: {
      id: string
      name: string
      email: string
      role: string
    }
  }[]
  projectId: string
  isAdmin: boolean
}

export function MemberList({ members, projectId, isAdmin }: MemberListProps) {
  const [addOpen, setAddOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const result = await addMember(projectId, email)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Member added!")
      setEmail("")
      setAddOpen(false)
    }
    setLoading(false)
  }

  async function handleRemove(userId: string) {
    const result = await removeMember(projectId, userId)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Member removed!")
    }
  }

  return (
    <div className="space-y-4">
      {isAdmin && (
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-gradient-to-r from-chart-1 to-chart-2 text-white shadow-lg shadow-blue-500/25"
        >
          <Plus className="mr-1 h-4 w-4" /> Add Member
        </Button>
      )}

      {/* Add Member Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
            <DialogDescription>
              Enter the email of the user you want to add to this project.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Add Member
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="space-y-2">
        {members.map((member) => (
          <Card key={member.id} className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-chart-1/20 to-chart-2/20">
                <span className="text-sm font-bold text-chart-1">
                  {member.user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{member.user.name}</p>
                <p className="text-xs text-muted-foreground">{member.user.email}</p>
              </div>
              <Badge variant={member.role === "ADMIN" ? "default" : "secondary"}>
                {member.role}
              </Badge>
              {isAdmin && member.role !== "ADMIN" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleRemove(member.user.id)}
                >
                  <UserX className="h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
