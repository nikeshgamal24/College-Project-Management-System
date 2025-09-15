import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

const TicketDetailModalSimple = ({ ticket, isOpen, onClose, onUpdate }) => {
  if (!ticket) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-xl font-semibold">
                Ticket #{ticket.ticketId || ticket._id}
              </DialogTitle>
              <DialogDescription className="text-base">
                {ticket.title}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardTitle>Ticket Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">
                {ticket.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Status:</strong> {ticket.status}
              </div>
              <div>
                <strong>Priority:</strong> {ticket.priority}
              </div>
              <div>
                <strong>Submitted By:</strong> {ticket.submittedByName}
              </div>
              <div>
                <strong>Email:</strong> {ticket.submittedByEmail}
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default TicketDetailModalSimple;
