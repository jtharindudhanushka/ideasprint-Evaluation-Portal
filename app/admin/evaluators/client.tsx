"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus, Users, Loader2 } from "lucide-react";
import type { Profile } from "@/lib/types/database";

interface Props {
  profiles: Profile[];
}

export function EvaluatorsClient({ profiles }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !fullName) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/create-evaluator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create evaluator");
      }

      toast.success(`Account created for ${email}`);
      setEmail("");
      setPassword("");
      setFullName("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const evaluators = profiles.filter((p) => p.role === "evaluator");
  const admins = profiles.filter((p) => p.role === "admin");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Manage Evaluators</h2>
        <p className="text-muted-foreground mt-2">
          Create evaluator accounts for panel members
        </p>
      </div>

      {/* Invite Form */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <UserPlus className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Create Evaluator Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateAccount} className="flex flex-col sm:flex-row gap-4 items-end mt-4">
            <div className="flex flex-col gap-2 flex-1">
              <Label htmlFor="invite-fullname">Full Name</Label>
              <Input
                id="invite-fullname"
                placeholder="Dr. Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="jane.doe@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <Label htmlFor="invite-password">Password</Label>
              <Input
                id="invite-password"
                type="text"
                placeholder="Secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button
              id="invite-submit"
              type="submit"
              disabled={loading}
              className="sm:self-end"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Users Table */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <CardTitle>All Users ({profiles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.length === 0 && evaluators.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                [...admins, ...evaluators].map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">
                      {profile.full_name || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={profile.role === "admin" ? "default" : "secondary"} className="capitalize">
                        {profile.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
