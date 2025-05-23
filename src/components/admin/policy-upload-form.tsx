// src/components/admin/policy-upload-form.tsx
'use client';

import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UploadCloud, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';
// Removed: import { uploadPolicyDocumentAction } from '@/app/actions';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['text/plain', 'application/pdf', 'text/markdown'];

const formSchema = z.object({
  policyFile: z
    .instanceof(FileList)
    .refine((files) => files?.length === 1, 'Please upload one file.')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `File size should be less than 5MB.`)
    .refine(
      (files) => ALLOWED_FILE_TYPES.includes(files?.[0]?.type),
      'Invalid file type. Only .txt, .pdf, .md are allowed.'
    ),
});

type FormData = z.infer<typeof formSchema>;

const PolicyUploadForm: React.FC = () => {
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const watchedFile = watch('policyFile');
  React.useEffect(() => {
    if (watchedFile && watchedFile.length > 0) {
      setFileName(watchedFile[0].name);
    } else {
      setFileName(null);
    }
  }, [watchedFile]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setUploadStatus(null);
    setUploadError(null);

    if (!data.policyFile || data.policyFile.length === 0) {
      setUploadError('No file selected.');
      return;
    }
    
    const file = data.policyFile[0];
    const formData = new FormData();
    formData.append('policyFile', file);
    formData.append('fileName', file.name);
    formData.append('fileType', file.type);

    console.log('Policy upload form submitted. File:', file.name, 'Type:', file.type);
    // The actual call to `uploadPolicyDocumentAction` was removed as part of reverting admin features.
    // Simulating an upload for UI purposes.
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate a response
    const success = Math.random() > 0.3; // Simulate occasional failure for demo
    if (success) {
      setUploadStatus(`"${file.name}" would have been processed.`);
      setUploadError(null);
      reset(); // Reset form on success
      setFileName(null);
    } else {
      setUploadError(`A simulated error occurred while processing "${file.name}".`);
      setUploadStatus(null);
    }
  };

  return (
    <Card className="w-full max-w-lg shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <UploadCloud className="mr-2 h-6 w-6 text-primary" />
          Upload HR Policy Document
        </CardTitle>
        <CardDescription>
          Upload new or updated HR policy documents (.txt, .pdf, .md format, max 5MB).
          The AI will use this information (feature pending).
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="policyFile" className="text-base font-medium">Policy File</Label>
            <div className="flex items-center justify-center w-full">
                <Label 
                    htmlFor="policyFile" 
                    className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 ${errors.policyFile ? 'border-destructive' : 'border-input'}`}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className={`w-10 h-10 mb-3 ${errors.policyFile ? 'text-destructive' : 'text-gray-400'}`} />
                        {fileName ? (
                            <p className="mb-2 text-sm text-foreground"><span className="font-semibold">{fileName}</span></p>
                        ) : (
                            <>
                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-muted-foreground">TXT, PDF, MD (MAX. 5MB)</p>
                            </>
                        )}
                    </div>
                    <Input 
                        id="policyFile" 
                        type="file" 
                        className="hidden" 
                        {...register('policyFile')}
                        accept=".txt,.pdf,.md,text/plain,application/pdf,text/markdown"
                    />
                </Label>
            </div>
            {errors.policyFile && (
              <p className="text-sm font-medium text-destructive flex items-center mt-1">
                <AlertTriangle size={16} className="mr-1" /> {errors.policyFile.message}
              </p>
            )}
          </div>

          {uploadStatus && (
            <Alert variant="default" className="bg-green-50 border-green-300">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-700">Upload Note</AlertTitle>
              <AlertDescription className="text-green-600">{uploadStatus}</AlertDescription>
            </Alert>
          )}
          {uploadError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Upload Error</AlertTitle>
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-5 w-5" /> Process Document (Simulated)
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PolicyUploadForm;
