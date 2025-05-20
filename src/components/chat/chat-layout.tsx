// src/components/chat/chat-layout.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { signInAnonymously, onAuthStateChanged, signInWithCustomToken, type User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, Timestamp, collection } from 'firebase/firestore';
import { ArrowRightCircle, HelpCircle, MessageSquare, User, Users, Send, AlertTriangle } from 'lucide-react';

import { auth, db } from '@/lib/firebase';
import { getAppId, getInitialAuthToken } from '@/config/app-config';
import { getAIResponseAction } from '@/app/actions';

import MessageBubble, { type Message } from './message-bubble';
import HelpModal from './help-modal';
import HumanHandoverModal from './human-handover-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

const ChatLayout: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHumanHandoverModal, setShowHumanHandoverModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const appIdRef = useRef<string | null>(null); // Use ref for appId as it's stable

  useEffect(() => {
    appIdRef.current = getAppId(); // Get appId once on mount
  }, []);

  // Firebase Authentication
  useEffect(() => {
    if (!auth) {
      console.warn("Firebase auth is not initialized.");
      setIsAuthReady(true); // Proceed without auth if Firebase is not set up
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      if (user) {
        setUserId(user.uid);
      } else {
        try {
          const token = getInitialAuthToken();
          if (token) {
            await signInWithCustomToken(auth, token);
          } else {
            await signInAnonymously(auth);
          }
        } catch (authError: any) {
          console.error("Error during sign-in:", authError);
          setError(`Authentication failed: ${authError.message}. Please try again later.`);
        }
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Load conversation from Firestore
  const loadConversation = useCallback(async () => {
    if (!db || !userId || !isAuthReady || !appIdRef.current) {
      if (isAuthReady && !db) console.warn("Firestore is not initialized. Cannot load conversation.");
      if (isAuthReady && db && !appIdRef.current) console.warn("App ID not available. Cannot load conversation.");
      
      // Set initial welcome message if we can't load
      if (conversation.length === 0) {
        setConversation([
            { sender: 'ai', text: "Hello! I'm the HR Policy AI Assistant. How can I help you with our company's HR policies today?", confidence: 'high', timestamp: new Date() }
        ]);
      }
      return;
    }
    setIsLoading(true);
    try {
      const conversationDocRef = doc(db, `artifacts/${appIdRef.current}/users/${userId}/hrFaqConversations`, 'mainThread');
      const docSnap = await getDoc(conversationDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const formattedMessages = (data.messages || []).map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp instanceof Timestamp ? msg.timestamp.toDate() : (msg.timestamp?.seconds ? new Date(msg.timestamp.seconds * 1000) : new Date())
        }));
        setConversation(formattedMessages);
      } else if (conversation.length === 0) {
        setConversation([
          { sender: 'ai', text: "Hello! I'm the HR Policy AI Assistant. How can I help you with our company's HR policies today?", confidence: 'high', timestamp: new Date() }
        ]);
      }
    } catch (e: any) {
      console.error("Error loading conversation:", e);
      setError(`Could not load your conversation history: ${e.message}`);
       if (conversation.length === 0) {
        setConversation([
            { sender: 'ai', text: "Hello! I'm the HR Policy AI Assistant. (Note: History couldn't be loaded)", confidence: 'high', timestamp: new Date() }
        ]);
       }
    } finally {
      setIsLoading(false);
    }
  }, [userId, isAuthReady, conversation.length]);

  useEffect(() => {
    if (userId && isAuthReady && appIdRef.current) {
      loadConversation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isAuthReady]); // loadConversation is memoized


  // Save conversation to Firestore
  const saveConversationBatch = async (updatedMessages: Message[]) => {
    if (!db || !userId || !appIdRef.current) {
      if (!db) console.warn("Firestore is not initialized. Cannot save conversation.");
      return;
    }
    try {
      const messagesToSave = updatedMessages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date ? Timestamp.fromDate(msg.timestamp) : (msg.timestamp || serverTimestamp())
      }));
      const conversationDocRef = doc(db, `artifacts/${appIdRef.current}/users/${userId}/hrFaqConversations`, 'mainThread');
      await setDoc(conversationDocRef, { messages: messagesToSave, lastUpdated: serverTimestamp() }, { merge: true });
    } catch (e: any) {
      console.error("Error saving conversation:", e);
      setError(`Could not save your conversation: ${e.message}. Your latest messages might not be stored.`);
    }
  };

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Handle user message submission
  const handleSendMessage = async () => {
    if (userInput.trim() === '' || isLoading) return;

    const userMessage: Message = { sender: 'user', text: userInput.trim(), timestamp: new Date() };
    const currentConversation = [...conversation, userMessage];
    setConversation(currentConversation);
    const textToSubmit = userInput;
    setUserInput('');
    setIsLoading(true);
    setError(null);
    
    // Optimistically save user message
    await saveConversationBatch(currentConversation);

    try {
      const aiResult = await getAIResponseAction(textToSubmit);
      
      const aiMessage: Message = { 
        sender: 'ai', 
        text: aiResult.responseText, 
        confidence: aiResult.confidence, 
        timestamp: new Date() 
      };
      const finalConversation = [...currentConversation, aiMessage];
      setConversation(finalConversation);
      await saveConversationBatch(finalConversation);

    } catch (e: any) {
      console.error("Error calling AI model or processing response:", e);
      const errorMessageText = `I apologize, but I'm having trouble connecting. Please try again. (Error: ${e.message || 'Unknown error'})`;
      const errorMessage: Message = { 
        sender: 'ai', 
        text: errorMessageText, 
        confidence: 'uncertain', 
        timestamp: new Date() 
      };
      const errorConversation = [...currentConversation, errorMessage];
      setConversation(errorConversation);
      await saveConversationBatch(errorConversation);
      setError(`Failed to get response from AI: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };
    
  if (!isAuthReady && !auth) { // If firebase itself failed to init
     return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
             <Alert variant="destructive" className="max-w-md">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Initialization Error</AlertTitle>
                <AlertDescription>
                HR Assistant could not be initialized. Firebase configuration might be missing or invalid. Please contact support.
                </AlertDescription>
            </Alert>
        </div>
     )
  }


  if (!isAuthReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="animate-pulse flex flex-col items-center space-y-2">
            <MessageSquare size={48} className="text-primary"/>
            <p className="text-lg text-foreground">Initializing HR Assistant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background font-sans">
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <div className="container mx-auto flex flex-wrap justify-between items-center">
          <h1 className="text-2xl font-semibold flex items-center">
            <MessageSquare size={28} className="mr-2"/> PolicyPal
          </h1>
          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            <Button
              onClick={() => setShowHelpModal(true)}
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-primary/80"
              aria-label="Help and FAQ"
            >
              <HelpCircle size={18} className="mr-1 sm:mr-2" /> <span className="hidden sm:inline">Help/FAQ</span>
            </Button>
            <Button
              onClick={() => setShowHumanHandoverModal(true)}
              variant="default"
              size="sm"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              aria-label="Talk to a Human"
            >
              <Users size={18} className="mr-1 sm:mr-2" /> <span className="hidden sm:inline">Talk to Human</span>
            </Button>
          </div>
        </div>
        { auth && userId && (
          <div className="container mx-auto mt-2 text-xs text-primary-foreground/80 bg-primary/90 p-2 rounded-md">
            <User size={14} className="inline mr-1" />
            You are interacting with an AI assistant. This AI is under development. For critical issues, use "Talk to a Human". User ID: <span className="font-mono bg-primary/70 px-1 rounded">{userId}</span>
          </div>
        )}
      </header>

      <ScrollArea className="flex-grow container mx-auto p-4 bg-card shadow-inner custom-scrollbar">
        <div className="max-w-3xl mx-auto">
            {error && (
            <Alert variant="destructive" className="mb-3">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
            )}
            {conversation.map((msg, index) => (
            <MessageBubble key={index} message={msg} />
            ))}
            <div ref={chatEndRef} />
        </div>
      </ScrollArea>

      <footer className="bg-muted/50 p-4 shadow-top">
        <div className="container mx-auto flex items-center max-w-3xl">
          <Input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            placeholder={isLoading ? "AI is thinking..." : "Ask about HR policies..."}
            className="flex-grow p-3 rounded-l-lg focus:ring-primary focus:border-transparent text-sm"
            disabled={isLoading}
            aria-label="Type your message"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || userInput.trim() === ''}
            className="bg-primary text-primary-foreground p-3 rounded-r-lg hover:bg-primary/90 w-24"
            aria-label="Send message"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
            ) : (
              <Send size={20} />
            )}
          </Button>
        </div>
      </footer>

      <HelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} userId={userId} />
      <HumanHandoverModal isOpen={showHumanHandoverModal} onClose={() => setShowHumanHandoverModal(false)} userId={userId} />
    </div>
  );
};

export default ChatLayout;
