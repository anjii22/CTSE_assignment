import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { userService } from "@/api/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const AdminUsersPage = () => {
  const { isAdmin } = useAuth();
  const sampleForm = {
    firstName: "Admin",
    lastName: "User",
    email: "testadmin1@gmail.com",
    password: "",
  };
  const [form, setForm] = useState({
    ...sampleForm,
  });

  const createAdminMutation = useMutation({
    mutationFn: () =>
      userService.register({ ...form } as any),
    onSuccess: () => {
      toast.success("Admin account created!");
      // Reset back to the sample values (password remains empty).
      setForm({ ...sampleForm });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to create admin"),
  });

  const update =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputType = (e.nativeEvent as any)?.inputType as string | undefined;
      const value = e.target.value;

      // Some browsers/password managers fire change events for autofill.
      // If it is autofill, force the sample values back so user details don't appear.
      if (inputType === "insertFromAutofill") {
        setForm((prev) => ({ ...prev, [field]: (sampleForm as any)[field] }));
        return;
      }

      setForm((prev) => ({ ...prev, [field]: value }));
    };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">User Management</h1>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Create Admin Account
          </CardTitle>
          <p className="text-sm text-muted-foreground">Only admins can create other admin accounts</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input
                value={form.firstName}
                onChange={update("firstName")}
                placeholder="Admin"
                autoComplete="off"
                name="admin_create_first_name"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input
                value={form.lastName}
                onChange={update("lastName")}
                placeholder="User"
                autoComplete="off"
                name="admin_create_last_name"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={update("email")}
              placeholder="testadmin1@gmail.com"
              autoComplete="off"
              name="admin_create_email"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              type="password"
              value={form.password}
              onChange={update("password")}
              placeholder=""
              autoComplete="new-password"
              name="admin_create_password"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>
          <Button
            onClick={() => {
              if (!isAdmin) {
                toast.error("Only admins can create admin accounts");
                return;
              }
              if (!form.password.trim()) {
                toast.error("Password is required to create an admin account");
                return;
              }
              createAdminMutation.mutate();
            }}
            disabled={createAdminMutation.isPending || !isAdmin}
            className="w-full"
          >
            {createAdminMutation.isPending ? "Creating..." : "Create Admin Account"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsersPage;
