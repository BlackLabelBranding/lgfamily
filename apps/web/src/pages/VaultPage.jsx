import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/supabaseClient.js';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Plus,
  FileText,
  Lock,
  AlertCircle,
  Eye,
  Download,
  Trash2,
  Upload,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DEV_HOUSEHOLD_ID = 'd2b8464e-a258-46a0-89de-a1b921062943';
const STORAGE_BUCKET = 'family-vault';

const CATEGORY_TABS = [
  'IDs',
  'Insurance',
  'Legal',
  'Medical',
  'Property',
  'Vehicles',
  'Financial',
];

const DEFAULT_FORM = {
  title: '',
  category: 'IDs',
  subcategory: '',
  permission: 'Admin Only',
  family_member_name: '',
  expiration_date: '',
  notes: '',
  file: null,
};

function VaultPage() {
  const [activeTab, setActiveTab] = useState('IDs');
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [documentToDelete, setDocumentToDelete] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    setIsLoading(true);
    setErrorMessage('');

    const { data, error } = await supabase
      .from('vault_documents')
      .select('*')
      .eq('household_id', DEV_HOUSEHOLD_ID)
      .order('created_at', { ascending: false });

    if (error) {
      setErrorMessage(
        'Could not load vault documents. Make sure the vault_documents table exists and your RLS/dev policies allow access.'
      );
      setDocuments([]);
      setIsLoading(false);
      return;
    }

    setDocuments(data ?? []);
    setIsLoading(false);
  }

  const documentsByCategory = useMemo(() => {
    const grouped = {};
    for (const category of CATEGORY_TABS) {
      grouped[category] = documents.filter((doc) => doc.category === category);
    }
    return grouped;
  }, [documents]);

  function resetForm() {
    setFormData(DEFAULT_FORM);
  }

  function handleInputChange(field, value) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0] ?? null;
    setFormData((prev) => ({
      ...prev,
      file,
    }));
  }

  function buildStoragePath({ category, fileName }) {
    const safeCategory = sanitizeSegment(category || 'uncategorized');
    const safeFileName = sanitizeFileName(fileName);
    return `households/${DEV_HOUSEHOLD_ID}/vault/${safeCategory}/${Date.now()}-${safeFileName}`;
  }

  async function uploadFileToStorage(file, category) {
    const filePath = buildStoragePath({
      category,
      fileName: file.name,
    });

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, { upsert: false });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return {
      filePath,
      publicUrl: publicData?.publicUrl ?? '',
    };
  }

  async function handleAddDocument(e) {
    e.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.title.trim()) {
      setErrorMessage('Please enter a title.');
      return;
    }

    if (!formData.file) {
      setErrorMessage('Please choose a file to upload.');
      return;
    }

    setIsUploading(true);

    try {
      const uploadResult = await uploadFileToStorage(
        formData.file,
        formData.category
      );

      const payload = {
        household_id: DEV_HOUSEHOLD_ID,
        title: formData.title.trim(),
        category: formData.category,
        subcategory: formData.subcategory.trim() || null,
        permission: formData.permission,
        family_member_name: formData.family_member_name.trim() || null,
        expiration_date: formData.expiration_date || null,
        notes: formData.notes.trim() || null,
        file_name: formData.file.name,
        file_path: uploadResult.filePath,
        file_url: uploadResult.publicUrl || null,
        mime_type: formData.file.type || null,
        file_size: formData.file.size || null,
      };

      const { error } = await supabase.from('vault_documents').insert(payload);

      if (error) {
        throw error;
      }

      setSuccessMessage('Document uploaded successfully.');
      setIsAddOpen(false);
      resetForm();
      await fetchDocuments();
    } catch (error) {
      setErrorMessage(
        error?.message ||
          'Upload failed. Check your Supabase bucket, table, and storage policies.'
      );
    } finally {
      setIsUploading(false);
    }
  }

  function openDeleteDialog(document) {
    setDocumentToDelete(document);
    setIsDeleteOpen(true);
  }

  async function handleDeleteDocument() {
    if (!documentToDelete) return;

    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (documentToDelete.file_path) {
        await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([documentToDelete.file_path]);
      }

      const { error } = await supabase
        .from('vault_documents')
        .delete()
        .eq('id', documentToDelete.id);

      if (error) {
        throw error;
      }

      setSuccessMessage('Document deleted.');
      setIsDeleteOpen(false);
      setDocumentToDelete(null);
      await fetchDocuments();
    } catch (error) {
      setErrorMessage(error?.message || 'Could not delete document.');
    }
  }

  function handleViewDocument(document) {
    if (document.file_url) {
      window.open(document.file_url, '_blank', 'noopener,noreferrer');
    }
  }

  async function handleDownloadDocument(document) {
    try {
      if (!document.file_path) return;

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(document.file_path, 60);

      if (error) {
        throw error;
      }

      if (data?.signedUrl) {
        const link = window.document.createElement('a');
        link.href = data.signedUrl;
        link.download = document.file_name || 'document';
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
      }
    } catch (error) {
      setErrorMessage(error?.message || 'Could not download document.');
    }
  }

  return (
    <>
      <Helmet>
        <title>Family Vault - FamilyHub</title>
        <meta
          name="description"
          content="Secure storage for important family documents and records"
        />
      </Helmet>

      <div className="space-y-6">
        <div className="flex justify-end">
          <Button
            className="gap-2 rounded-xl shadow-sm"
            onClick={() => {
              resetForm();
              setIsAddOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add document
          </Button>
        </div>

        {(errorMessage || successMessage) && (
          <div className="space-y-2">
            {errorMessage ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            {successMessage ? (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
                {successMessage}
              </div>
            ) : null}
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid h-auto w-full grid-cols-2 rounded-2xl bg-muted p-1 sm:grid-cols-4 lg:grid-cols-7">
            {CATEGORY_TABS.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="rounded-xl text-xs sm:text-sm"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {CATEGORY_TABS.map((category) => (
            <TabsContent
              key={category}
              value={category}
              className="space-y-4"
            >
              {isLoading ? (
                <Card className="rounded-3xl shadow-sm">
                  <CardContent className="p-12 text-center text-sm text-muted-foreground">
                    Loading documents...
                  </CardContent>
                </Card>
              ) : documentsByCategory[category]?.length ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {documentsByCategory[category].map((doc) => (
                    <VaultDocumentCard
                      key={doc.id}
                      document={doc}
                      onView={() => handleViewDocument(doc)}
                      onDownload={() => handleDownloadDocument(doc)}
                      onDelete={() => openDeleteDialog(doc)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyVaultState
                  category={category}
                  onAdd={() => {
                    resetForm();
                    setFormData((prev) => ({
                      ...prev,
                      category,
                    }));
                    setIsAddOpen(true);
                  }}
                />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <Dialog
        open={isAddOpen}
        onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add document</DialogTitle>
            <DialogDescription>
              Upload a document into the family vault.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddDocument} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title" required>
                <input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Example: Sarah's passport"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  required
                />
              </Field>

              <Field label="Category" required>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  required
                >
                  {CATEGORY_TABS.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Subcategory">
                <input
                  value={formData.subcategory}
                  onChange={(e) =>
                    handleInputChange('subcategory', e.target.value)
                  }
                  placeholder="Example: Passport, License, Policy"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                />
              </Field>

              <Field label="Permission">
                <select
                  value={formData.permission}
                  onChange={(e) =>
                    handleInputChange('permission', e.target.value)
                  }
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="Admin Only">Admin Only</option>
                  <option value="View Only">View Only</option>
                </select>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Family member name">
                <input
                  value={formData.family_member_name}
                  onChange={(e) =>
                    handleInputChange('family_member_name', e.target.value)
                  }
                  placeholder="Example: Sarah"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                />
              </Field>

              <Field label="Expiration date">
                <input
                  type="date"
                  value={formData.expiration_date}
                  onChange={(e) =>
                    handleInputChange('expiration_date', e.target.value)
                  }
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                />
              </Field>
            </div>

            <Field label="Notes">
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Optional notes"
                className="min-h-[110px] w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </Field>

            <Field label="File" required>
              <div className="rounded-2xl border border-dashed p-4">
                <div className="flex items-center gap-3">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="block w-full text-sm"
                      required
                    />
                    {formData.file ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {formData.file.name}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </Field>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  setIsAddOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isUploading}
                className="gap-2 rounded-xl"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Save document'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete this document from the vault and remove
              the stored file.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-2xl border bg-muted/40 p-3 text-sm">
            {documentToDelete?.title || 'Selected document'}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => {
                setIsDeleteOpen(false);
                setDocumentToDelete(null);
              }}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="destructive"
              className="rounded-xl"
              onClick={handleDeleteDocument}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function VaultDocumentCard({ document, onView, onDownload, onDelete }) {
  const isExpiringSoon = getExpirationWarning(document.expiration_date);
  const isLocked = document.permission === 'Admin Only';

  return (
    <Card
      className={cn(
        'rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md',
        isExpiringSoon && 'border-amber-300'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100">
            <FileText className="h-6 w-6 text-slate-500" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="truncate font-medium text-sm">{document.title}</h4>
                {document.family_member_name ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {document.family_member_name}
                  </p>
                ) : null}
              </div>

              {isLocked ? (
                <Lock className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              ) : null}
            </div>

            <div className="space-y-2">
              {document.expiration_date ? (
                <div className="flex items-center gap-2 text-xs">
                  {isExpiringSoon ? (
                    <AlertCircle className="h-3 w-3 text-amber-500" />
                  ) : null}
                  <span
                    className={cn(
                      'text-muted-foreground',
                      isExpiringSoon && 'font-medium text-amber-600'
                    )}
                  >
                    Expires: {formatDisplayDate(document.expiration_date)}
                  </span>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {document.permission || 'Admin Only'}
                </Badge>
                {document.subcategory ? (
                  <Badge variant="outline" className="text-xs">
                    {document.subcategory}
                  </Badge>
                ) : null}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1 rounded-xl text-xs"
                onClick={onView}
              >
                <Eye className="h-3 w-3" />
                View
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="h-8 gap-1 rounded-xl text-xs"
                onClick={onDownload}
              >
                <Download className="h-3 w-3" />
                Download
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="h-8 gap-1 rounded-xl text-xs text-destructive hover:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyVaultState({ category, onAdd }) {
  return (
    <Card className="rounded-3xl border border-dashed shadow-sm">
      <CardContent className="flex min-h-[260px] flex-col items-center justify-center px-6 py-12 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <FileText className="h-6 w-6 text-slate-500" />
        </div>

        <h3 className="mb-2 text-lg font-semibold">
          No {category.toLowerCase()} documents yet
        </h3>

        <p className="mb-5 max-w-md text-sm text-muted-foreground">
          Add your first document to this section of the family vault.
        </p>

        <Button onClick={onAdd} className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" />
          Add document
        </Button>
      </CardContent>
    </Card>
  );
}

function Field({ label, required = false, children }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label} {required ? <span className="text-destructive">*</span> : null}
      </label>
      {children}
    </div>
  );
}

function sanitizeSegment(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '');
}

function sanitizeFileName(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '');
}

function formatDisplayDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getExpirationWarning(dateString) {
  if (!dateString) return false;
  const today = new Date();
  const expiration = new Date(`${dateString}T00:00:00`);
  const diffMs = expiration.getTime() - today.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= 90;
}

export default VaultPage;
