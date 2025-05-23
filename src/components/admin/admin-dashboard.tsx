// src/components/admin/admin-dashboard.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import PolicyUploadForm from './policy-upload-form'; // Removed to prevent build error

const AdminDashboard: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary">Admin Dashboard</CardTitle>
          <CardDescription>Manage application settings and HR policies.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Welcome to the admin dashboard. Policy upload functionality is currently being revised.</p>
          {/* <PolicyUploadForm /> */}
        </CardContent>
      </Card>

      {/* Placeholder for other admin sections */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>User Management (Placeholder)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">User management features would appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
