// src/components/chat/help-modal.tsx
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

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, userId }) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Help & FAQ</DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-sm space-y-3 mt-2 text-muted-foreground">
          <div>
            <p className="font-semibold text-foreground">What can I ask?</p>
            <p>You can ask questions about our company's HR policies, such as vacation time, sick leave, work from home procedures, dress code, and performance reviews.</p>
          </div>
          <div>
            <p className="font-semibold text-foreground">How does it work?</p>
            <p>This AI uses a predefined set of company policies to answer your questions. It tries its best to be accurate based on that information.</p>
          </div>
          <div>
            <p className="font-semibold text-foreground">What if the AI is unsure or wrong?</p>
            <p>The AI will try to tell you if it's unsure. Since it's still learning, it might make mistakes. For important or complex matters, always use the "Talk to a Human" option to contact HR directly.</p>
          </div>
          <div>
            <p className="font-semibold text-foreground">Is my conversation saved?</p>
            <p>Yes, your conversation is saved to help you continue later and for us to improve the assistant. Your User ID is: <span className="font-mono bg-muted px-1 rounded text-foreground">{userId || "N/A"}</span>.</p>
          </div>
          <div>
            <p className="font-semibold text-foreground">Data Privacy:</p>
            <p>Please avoid sharing sensitive personal information not directly related to HR policy questions in this chat.</p>
          </div>
        </DialogDescription>
        <DialogFooter className="mt-4">
          <Button onClick={onClose} variant="outline">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HelpModal;
