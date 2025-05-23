// src/app/admin/page.tsx
'use client';

import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminPage() {
  // Since useAuthWithRole was part of the reverted features,
  // this page will now show a generic message.
  // A proper implementation would re-introduce role checking if needed.

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center text-2xl font-bold text-primary">
            <ShieldAlert size={32} className="mr-3" />
            Admin Area
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="flex flex-col items-center text-muted-foreground">
            <AlertTriangle size={48} className="mb-4 text-destructive" />
            <p className="text-lg font-semibold">Access Restricted</p>
            <p>
              The admin panel is currently undergoing changes or access is restricted.
            </p>
            <p className="text-sm mt-2">
              If you believe you should have access, please contact support.
            </p>
          </div>
          {/* Placeholder for admin content that would normally be here */}
          {/* For example: <AdminDashboard /> would be here if roles were active */}
          <div className="p-4 border border-dashed rounded-md bg-muted/50">
            <p className="text-sm text-muted-foreground">
              Admin functionalities are temporarily unavailable.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/">Return to Homepage</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
