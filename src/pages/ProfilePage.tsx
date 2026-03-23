import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { userService } from "@/api/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const ProfilePage = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });
  const [prefs, setPrefs] = useState({
    notifications: user?.preferences?.notifications ?? true,
    emailUpdates: user?.preferences?.emailUpdates ?? true,
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      userService.updateProfile(user!.id, {
        ...form,
        preferences: prefs,
      } as any),
    onSuccess: () => {
      toast.success("Profile updated!");
      const updated = { ...user!, ...form, preferences: prefs };
      localStorage.setItem("user", JSON.stringify(updated));
    },
    onError: () => toast.error("Failed to update profile"),
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={form.email} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Input value={user?.role || ""} disabled className="bg-muted capitalize" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Push Notifications</p>
              <p className="text-xs text-muted-foreground">Receive booking updates</p>
            </div>
            <Switch checked={prefs.notifications} onCheckedChange={(v) => setPrefs((p) => ({ ...p, notifications: v }))} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Email Updates</p>
              <p className="text-xs text-muted-foreground">Receive event recommendations</p>
            </div>
            <Switch checked={prefs.emailUpdates} onCheckedChange={(v) => setPrefs((p) => ({ ...p, emailUpdates: v }))} />
          </div>
        </CardContent>
      </Card>

      <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending} size="lg">
        {updateMutation.isPending ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
};

export default ProfilePage;
