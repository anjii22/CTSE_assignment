import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { eventService } from "@/api/services";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

const categories = ["music", "sports", "tech", "arts", "food", "conference", "workshop", "other"];

const AdminEventFormPage = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: "", description: "", category: "music", date: "", time: "",
    price: "", totalTickets: "", imageUrl: "", status: "draft",
    venueName: "", venueAddress: "", venueCity: "",
  });

  const { data: existingEvent } = useQuery({
    queryKey: ["event", id],
    queryFn: () => eventService.getById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingEvent?.data) {
      const e = existingEvent.data;
      setForm({
        title: e.title, description: e.description, category: e.category,
        date: e.date?.split("T")[0] || "", time: e.time, price: String(e.price),
        totalTickets: String(e.totalTickets), imageUrl: e.imageUrl || "",
        status: e.status, venueName: e.venue.name,
        venueAddress: e.venue.address, venueCity: e.venue.city,
      });
    }
  }, [existingEvent]);

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        title: form.title, description: form.description, category: form.category,
        date: form.date, time: form.time, price: Number(form.price),
        totalTickets: Number(form.totalTickets), imageUrl: form.imageUrl,
        status: form.status, organizerId: user!.id,
        venue: { name: form.venueName, address: form.venueAddress, city: form.venueCity },
      };
      return isEdit ? eventService.update(id!, payload) : eventService.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? "Event updated!" : "Event created!");
      queryClient.invalidateQueries({ queryKey: ["adminEvents"] });
      navigate("/admin/events");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed"),
  });

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <h1 className="text-3xl font-bold">{isEdit ? "Edit Event" : "Create Event"}</h1>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={update("title")} placeholder="Event title" required />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={update("description")} placeholder="Event description" rows={4} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={update("date")} />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input value={form.time} onChange={update("time")} placeholder="19:00" />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Price ($)</Label>
              <Input type="number" value={form.price} onChange={update("price")} placeholder="49.99" />
            </div>
            <div className="space-y-2">
              <Label>Total Tickets</Label>
              <Input type="number" value={form.totalTickets} onChange={update("totalTickets")} placeholder="500" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Image URL (optional)</Label>
            <Input value={form.imageUrl} onChange={update("imageUrl")} placeholder="https://..." />
          </div>

          <Card className="bg-muted/50">
            <CardHeader className="pb-3"><CardTitle className="text-base">Venue Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Venue Name</Label>
                  <Input value={form.venueName} onChange={update("venueName")} placeholder="Arena name" />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input value={form.venueAddress} onChange={update("venueAddress")} placeholder="123 Main St" />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={form.venueCity} onChange={update("venueCity")} placeholder="New York" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} size="lg" className="w-full">
            {mutation.isPending ? "Saving..." : isEdit ? "Update Event" : "Create Event"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminEventFormPage;
