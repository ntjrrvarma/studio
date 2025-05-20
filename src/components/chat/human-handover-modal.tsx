// src/components/chat/human-handover-modal.tsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRightCircle } from "lucide-react";

interface HumanHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

const HumanHandoverModal: React.FC<HumanHandoverModalProps> = ({ isOpen, onClose, userId }) => {
  if (!isOpen) return null;

  const handleEmailHR = () => {
    window.location.href = `mailto:hr@example.com?subject=HR Policy Question (from AI Assistant User ID: ${userId || 'N/A'})&body=Hello HR Team,\n\nI have a question regarding HR policies...\n\n(Please describe your question here)\n\nThank you.`;
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Talk to a Human</DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-sm text-muted-foreground mt-2">
          If the AI assistant couldn't help or you have a sensitive issue, please contact our HR department directly.
        </DialogDescription>
        <div className="space-y-3 my-4 text-sm text-muted-foreground">
          <p><strong>Email:</strong> <a href="mailto:hr@example.com" className="text-primary hover:underline">hr@example.com</a></p>
          <p><strong>Phone:</strong> (555) 123-4567 (Mon-Fri, 9 AM - 5 PM)</p>
          <p className="text-xs">Please mention you were using the AI Assistant and provide your User ID if possible: <span className="font-mono bg-muted px-1 rounded text-foreground">{userId || "N/A"}</span></p>
        </div>
        <DialogFooter className="mt-4">
            <Button onClick={onClose} variant="outline" className="mr-2">Cancel</Button>
            <Button onClick={handleEmailHR} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <ArrowRightCircle size={20} className="mr-2"/> Open Email to HR
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HumanHandoverModal;
