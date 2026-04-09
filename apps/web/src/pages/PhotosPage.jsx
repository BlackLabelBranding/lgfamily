import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import Sidebar from '@/components/Sidebar.jsx';
import Header from '@/components/Header.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
  Image as ImageIcon,
  Users,
  Calendar,
  FileText,
  Pencil,
  Trash2,
  Upload,
} from 'lucide-react';

const initialFamilyMembers = [
  { id: '1', name: 'Shelby' },
  { id: '2', name: 'Pamela' },
  { id: '3', name: 'Roger' },
  { id: '4', name: 'Angelea' },
  { id: '5', name: 'Jacey' },
  { id: '6', name: 'Zander' },
  { id: '7', name: 'Kasper' },
];

const initialMemories = [
  {
    id: 'm1',
    title: 'Summer lake weekend',
    description: 'A fun family weekend at the lake with swimming, grilling, and late-night laughs.',
    date: '2026-03-18',
    category: 'Vacation',
    people: ['Shelby', 'Zander', 'Kasper'],
    photo:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    type: 'album',
  },
  {
    id: 'm2',
    title: 'Zander lost his first tooth',
    description: 'Big milestone day and he was very proud of it.',
    date: '2026-02-09',
    category: 'Milestone',
    people: ['Zander', 'Shelby'],
    photo:
      'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=80',
    type: 'milestone',
  },
  {
    id: 'm3',
    title: 'Christmas morning',
    description: 'Pajamas, gifts, coffee, and a packed living room.',
    date: '2025-12-25',
    category: 'Holiday',
    people: ['Shelby', 'Zander', 'Kasper'],
    photo:
      'https://images.unsplash.com/photo-1512389098783-66b81f86e199?auto=format&fit=crop&w=1200&q=80',
    type: 'album',
  },
  {
    id: 'm4',
    title: 'School paperwork scanned',
    description: 'Important school form saved for easy access later.',
    date: '2026-04-02',
    category: 'Document',
    people: ['Zander'],
    photo: '',
    type: 'scan',
    fileLabel: 'School enrollment form',
  },
];

const emptyForm = {
  title: '',
  description: '',
  date: '',
  category: 'Everyday',
  people: [],
  photo: '',
  type: 'album',
  fileLabel: '',
};

const emptyBulkForm = {
  date: '',
  category: 'Everyday',
  people: [],
  type: 'album',
  description: '',
  files: [],
};

function PhotosPage() {
  const [familyMembers] = useState(initialFamilyMembers);
  const [memories, setMemories] = useState(initialMemories);
  const [activeTab, setActiveTab] = useState('albums');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

  const [editingMemory, setEditingMemory] = useState(null);
  const [selectedMemory, setSelectedMemory] = useState(null);

  const [formData, setFormData] = useState(emptyForm);
  const [bulkForm, setBulkForm] = useState(emptyBulkForm);

  const [personFilter, setPersonFilter] = useState('All members');
  const [categoryFilter, setCategoryFilter] = useState('All categories');

  const categories = ['Birthday', 'Holiday', 'Vacation', 'School', 'Milestone', 'Everyday', 'Document', 'Other'];

  const sortedMemories = useMemo(() => {
    return [...memories].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [memories]);

  const albums = useMemo(() => {
    return sortedMemories.filter((memory) => memory.type === 'album');
  }, [sortedMemories]);

  const milestones = useMemo(() => {
    return sortedMemories.filter((memory) => memory.type === 'milestone');
  }, [sortedMemories]);

  const scans = useMemo(() => {
    return sortedMemories.filter((memory) => memory.type === 'scan');
  }, [sortedMemories]);

  const filteredByPerson = useMemo(() => {
    return sortedMemories.filter((memory) => {
      const matchesPerson =
        personFilter === 'All members' || memory.people.includes(personFilter);
      const matchesCategory =
        categoryFilter === 'All categories' || memory.category === categoryFilter;
      return matchesPerson && matchesCategory;
    });
  }, [sortedMemories, personFilter, categoryFilter]);

  function resetForm() {
    setFormData(emptyForm);
    setEditingMemory(null);
  }

  function resetBulkForm() {
    setBulkForm(emptyBulkForm);
  }

  function openAddDialog(type = 'album') {
    setEditingMemory(null);
    setFormData({ ...emptyForm, type });
    setIsFormOpen(true);
  }

  function openEditDialog(memory) {
    setEditingMemory(memory);
    setFormData({
      title: memory.title || '',
      description: memory.description || '',
      date: memory.date || '',
      category: memory.category || 'Everyday',
      people: memory.people || [],
      photo: memory.photo || '',
      type: memory.type || 'album',
      fileLabel: memory.fileLabel || '',
    });
    setIsFormOpen(true);
  }

  function openDetailDialog(memory) {
    setSelectedMemory(memory);
    setIsDetailOpen(true);
  }

  function openBulkUploadDialog() {
    resetBulkForm();
    setIsBulkUploadOpen(true);
  }

  function handleInputChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function togglePerson(name) {
    setFormData((prev) => {
      const exists = prev.people.includes(name);
      return {
        ...prev,
        people: exists
          ? prev.people.filter((person) => person !== name)
          : [...prev.people, name],
      };
    });
  }

  function toggleBulkPerson(name) {
    setBulkForm((prev) => {
      const exists = prev.people.includes(name);
      return {
        ...prev,
        people: exists
          ? prev.people.filter((person) => person !== name)
          : [...prev.people, name],
      };
    });
  }

  function handlePhotoUrlChange(e) {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, photo: value }));
  }

  function handleBulkFilesChange(e) {
    const files = Array.from(e.target.files || []);
    setBulkForm((prev) => ({ ...prev, files }));
  }

  function handleSaveMemory(e) {
    e.preventDefault();

    if (!formData.title.trim()) return;
    if (!formData.date) return;

    const payload = {
      id: editingMemory?.id || `memory-${Date.now()}`,
      title: formData.title.trim(),
      description: formData.description.trim(),
      date: formData.date,
      category: formData.category,
      people: formData.people,
      photo: formData.photo.trim(),
      type: formData.type,
      fileLabel: formData.fileLabel.trim(),
    };

    if (editingMemory) {
      setMemories((prev) =>
        prev.map((memory) => (memory.id === editingMemory.id ? payload : memory))
      );
    } else {
      setMemories((prev) => [payload, ...prev]);
    }

    setIsFormOpen(false);
    resetForm();
  }

  function handleBulkUpload(e) {
    e.preventDefault();

    if (!bulkForm.files.length || !bulkForm.date) return;

    const newItems = bulkForm.files.map((file, index) => ({
      id: `bulk-${Date.now()}-${index}`,
      title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      description: bulkForm.description.trim(),
      date: bulkForm.date,
      category: bulkForm.category,
      people: bulkForm.people,
      type: bulkForm.type,
      photo: URL.createObjectURL(file),
      fileLabel: '',
    }));

    setMemories((prev) => [...newItems, ...prev]);
    setIsBulkUploadOpen(false);
    resetBulkForm();
  }

  function handleDeleteMemory(id) {
    setMemories((prev) => prev.filter((memory) => memory.id !== id));
    if (selectedMemory?.id === id) {
      setIsDetailOpen(false);
      setSelectedMemory(null);
    }
  }

  function renderMemoryCard(memory, square = false) {
    return (
      <Card
        key={memory.id}
        className="overflow-hidden rounded-2xl shadow-sm transition-all duration-200 hover:shadow-lg"
      >
        <CardContent className="p-0">
          <button
            type="button"
            className="block w-full text-left"
            onClick={() => openDetailDialog(memory)}
          >
            {memory.type === 'scan' ? (
              <div className="flex aspect-video items-center justify-center bg-muted">
                <FileText className="h-12 w-12 text-muted-foreground" />
              </div>
            ) : (
              <div
                className={`${square ? 'aspect-square' : 'aspect-video'} overflow-hidden bg-muted`}
              >
                {memory.photo ? (
                  <img
                    src={memory.photo}
                    alt={memory.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
            )}
          </button>

          <div className="p-4">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <h4 className="font-semibold text-sm">{memory.title}</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDisplayDate(memory.date)}
                </p>
              </div>
              <Badge variant="secondary" className="text-[11px]">
                {memory.category}
              </Badge>
            </div>

            {memory.description ? (
              <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">
                {memory.description}
              </p>
            ) : null}

            {memory.fileLabel ? (
              <p className="mb-3 text-xs text-muted-foreground">{memory.fileLabel}</p>
            ) : null}

            <div className="mb-3 flex flex-wrap gap-1">
              {memory.people.slice(0, 3).map((person) => (
                <Badge key={`${memory.id}-${person}`} variant="outline" className="text-[11px]">
                  {person}
                </Badge>
              ))}
              {memory.people.length > 3 ? (
                <Badge variant="outline" className="text-[11px]">
                  +{memory.people.length - 3}
                </Badge>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1 rounded-xl"
                onClick={() => openEditDialog(memory)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1 rounded-xl text-destructive hover:text-destructive"
                onClick={() => handleDeleteMemory(memory.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Helmet>
        <title>Photos & Memories - FamilyHub</title>
        <meta name="description" content="Family photos, memories, milestones, and scanned documents" />
      </Helmet>

      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <Header />

          <main className="p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h1 className="mb-2 text-3xl font-bold tracking-tight">Photos & memories</h1>
                  <p className="text-muted-foreground">
                    Preserve family moments, milestones, and important records.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="gap-2 rounded-xl shadow-sm"
                    onClick={() => openAddDialog('album')}
                  >
                    <Plus className="h-4 w-4" />
                    Add memory
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 rounded-xl"
                    onClick={() => openAddDialog('scan')}
                  >
                    <FileText className="h-4 w-4" />
                    Add scan
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 rounded-xl"
                    onClick={openBulkUploadDialog}
                  >
                    <Upload className="h-4 w-4" />
                    Mass upload
                  </Button>
                </div>
              </div>

              <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard icon={<ImageIcon className="h-5 w-5 text-muted-foreground" />} label="Albums" value={albums.length} />
                <StatCard icon={<Calendar className="h-5 w-5 text-muted-foreground" />} label="Milestones" value={milestones.length} />
                <StatCard icon={<FileText className="h-5 w-5 text-muted-foreground" />} label="Scans" value={scans.length} />
                <StatCard icon={<Users className="h-5 w-5 text-muted-foreground" />} label="Tagged members" value={familyMembers.length} />
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid h-auto w-full grid-cols-2 sm:grid-cols-4">
                  <TabsTrigger value="albums" className="text-xs sm:text-sm">
                    Albums
                  </TabsTrigger>
                  <TabsTrigger value="by-person" className="text-xs sm:text-sm">
                    By person
                  </TabsTrigger>
                  <TabsTrigger value="milestones" className="text-xs sm:text-sm">
                    Milestones
                  </TabsTrigger>
                  <TabsTrigger value="scans" className="text-xs sm:text-sm">
                    Scans
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="albums" className="space-y-4">
                  {albums.length ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {albums.map((memory) => renderMemoryCard(memory))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No photo memories yet"
                      description="Add your first family memory to start building your archive."
                      actionLabel="Add memory"
                      onAction={() => openAddDialog('album')}
                    />
                  )}
                </TabsContent>

                <TabsContent value="by-person" className="space-y-4">
                  <div className="rounded-2xl border bg-card p-4 shadow-sm">
                    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h3 className="font-semibold">Filter memories</h3>
                        <p className="text-sm text-muted-foreground">
                          Browse photos and memories by family member or category.
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <select
                          value={personFilter}
                          onChange={(e) => setPersonFilter(e.target.value)}
                          className="h-10 rounded-md border bg-background px-3 text-sm"
                        >
                          <option>All members</option>
                          {familyMembers.map((member) => (
                            <option key={member.id} value={member.name}>
                              {member.name}
                            </option>
                          ))}
                        </select>

                        <select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className="h-10 rounded-md border bg-background px-3 text-sm"
                        >
                          <option>All categories</option>
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mb-2 flex flex-wrap gap-2">
                      <Badge variant="secondary">{personFilter}</Badge>
                      <Badge variant="outline">{categoryFilter}</Badge>
                    </div>
                  </div>

                  {filteredByPerson.length ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      {filteredByPerson.map((memory) => renderMemoryCard(memory, true))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No matching memories"
                      description="Try changing the selected person or category."
                    />
                  )}
                </TabsContent>

                <TabsContent value="milestones" className="space-y-4">
                  {milestones.length ? (
                    <div className="space-y-4">
                      {milestones.map((memory) => (
                        <Card key={memory.id} className="rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                  <h4 className="font-semibold text-sm">{memory.title}</h4>
                                  <Badge variant="secondary" className="text-[11px]">
                                    {memory.category}
                                  </Badge>
                                </div>

                                <p className="mb-2 text-xs text-muted-foreground">
                                  {formatDisplayDate(memory.date)}
                                </p>

                                {memory.description ? (
                                  <p className="mb-3 text-sm text-muted-foreground">{memory.description}</p>
                                ) : null}

                                <div className="mb-3 flex flex-wrap gap-1">
                                  {memory.people.map((person) => (
                                    <Badge key={`${memory.id}-${person}`} variant="outline" className="text-[11px]">
                                      {person}
                                    </Badge>
                                  ))}
                                </div>

                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" className="rounded-xl" onClick={() => openDetailDialog(memory)}>
                                    View
                                  </Button>
                                  <Button variant="outline" size="sm" className="rounded-xl" onClick={() => openEditDialog(memory)}>
                                    Edit
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No milestones yet"
                      description="Capture big family moments like birthdays, first days, and achievements."
                      actionLabel="Add milestone"
                      onAction={() => openAddDialog('milestone')}
                    />
                  )}
                </TabsContent>

                <TabsContent value="scans" className="space-y-4">
                  {scans.length ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {scans.map((memory) => (
                        <Card key={memory.id} className="rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="mb-1 flex flex-wrap items-center gap-2">
                                  <h4 className="font-medium text-sm">{memory.title}</h4>
                                  <Badge variant="secondary" className="text-[11px]">
                                    {memory.category}
                                  </Badge>
                                </div>

                                {memory.fileLabel ? (
                                  <p className="text-xs text-muted-foreground">{memory.fileLabel}</p>
                                ) : null}

                                <p className="mt-1 text-xs text-muted-foreground">
                                  Saved {formatDisplayDate(memory.date)}
                                </p>

                                <div className="mt-3 flex gap-2">
                                  <Button variant="outline" size="sm" className="rounded-xl" onClick={() => openDetailDialog(memory)}>
                                    View
                                  </Button>
                                  <Button variant="outline" size="sm" className="rounded-xl" onClick={() => openEditDialog(memory)}>
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-xl text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteMemory(memory.id)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No saved scans yet"
                      description="Store important family documents, forms, and records here."
                      actionLabel="Add scan"
                      onAction={() => openAddDialog('scan')}
                    />
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingMemory ? 'Edit memory' : 'Add memory'}</DialogTitle>
            <DialogDescription>
              Save a family photo, milestone, or scanned document in one place.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveMemory} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title" required>
                <input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Memory title"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  required
                />
              </Field>

              <Field label="Date" required>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  required
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Type">
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="album">Album memory</option>
                  <option value="milestone">Milestone</option>
                  <option value="scan">Scan / document</option>
                </select>
              </Field>

              <Field label="Category">
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Description">
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Add the story behind this memory"
                className="min-h-[110px] w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </Field>

            {formData.type === 'scan' ? (
              <Field label="Document label">
                <input
                  value={formData.fileLabel}
                  onChange={(e) => handleInputChange('fileLabel', e.target.value)}
                  placeholder="Example: Birth certificate, school form, insurance card"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                />
              </Field>
            ) : (
              <Field label="Photo URL">
                <input
                  value={formData.photo}
                  onChange={handlePhotoUrlChange}
                  placeholder="Paste image URL for now"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                />
              </Field>
            )}

            <Field label="Tagged family members">
              <div className="flex flex-wrap gap-2">
                {familyMembers.map((member) => {
                  const active = formData.people.includes(member.name);
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => togglePerson(member.name)}
                      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs transition ${
                        active
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background text-foreground'
                      }`}
                    >
                      {member.name}
                    </button>
                  );
                })}
              </div>
            </Field>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  setIsFormOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl">
                {editingMemory ? 'Save changes' : 'Add memory'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isBulkUploadOpen}
        onOpenChange={(open) => {
          setIsBulkUploadOpen(open);
          if (!open) resetBulkForm();
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Mass upload photos</DialogTitle>
            <DialogDescription>
              Upload multiple photos at once using the same settings.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBulkUpload} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Date" required>
                <input
                  type="date"
                  value={bulkForm.date}
                  onChange={(e) => setBulkForm((prev) => ({ ...prev, date: e.target.value }))}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  required
                />
              </Field>

              <Field label="Category">
                <select
                  value={bulkForm.category}
                  onChange={(e) => setBulkForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Type">
                <select
                  value={bulkForm.type}
                  onChange={(e) => setBulkForm((prev) => ({ ...prev, type: e.target.value }))}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="album">Album memory</option>
                  <option value="milestone">Milestone</option>
                </select>
              </Field>

              <Field label="Photos" required>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleBulkFilesChange}
                  className="block w-full text-sm"
                  required
                />
                {bulkForm.files.length > 0 ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {bulkForm.files.length} file(s) selected
                  </p>
                ) : null}
              </Field>
            </div>

            <Field label="Shared description">
              <textarea
                value={bulkForm.description}
                onChange={(e) => setBulkForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Optional shared description for all uploaded photos"
                className="min-h-[110px] w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </Field>

            <Field label="Tagged family members">
              <div className="flex flex-wrap gap-2">
                {familyMembers.map((member) => {
                  const active = bulkForm.people.includes(member.name);
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => toggleBulkPerson(member.name)}
                      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs transition ${
                        active
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background text-foreground'
                      }`}
                    >
                      {member.name}
                    </button>
                  );
                })}
              </div>
            </Field>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  setIsBulkUploadOpen(false);
                  resetBulkForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl">
                Upload all
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open);
          if (!open) setSelectedMemory(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          {selectedMemory ? (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMemory.title}</DialogTitle>
                <DialogDescription>
                  {formatDisplayDate(selectedMemory.date)} • {selectedMemory.category}
                </DialogDescription>
              </DialogHeader>

              {selectedMemory.type === 'scan' ? (
                <div className="flex aspect-video items-center justify-center rounded-xl bg-muted">
                  <FileText className="h-16 w-16 text-muted-foreground" />
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl bg-muted">
                  {selectedMemory.photo ? (
                    <img
                      src={selectedMemory.photo}
                      alt={selectedMemory.title}
                      className="h-auto max-h-[420px] w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-video items-center justify-center">
                      <ImageIcon className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                {selectedMemory.description ? (
                  <p className="text-sm text-muted-foreground">{selectedMemory.description}</p>
                ) : null}

                {selectedMemory.fileLabel ? (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Document
                    </p>
                    <p className="text-sm">{selectedMemory.fileLabel}</p>
                  </div>
                ) : null}

                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Tagged family members
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMemory.people.length ? (
                      selectedMemory.people.map((person) => (
                        <Badge key={`${selectedMemory.id}-detail-${person}`} variant="outline">
                          {person}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No one tagged yet.</span>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => openEditDialog(selectedMemory)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl text-destructive hover:text-destructive"
                  onClick={() => handleDeleteMemory(selectedMemory.id)}
                >
                  Delete
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold">{value}</p>
        </div>
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

function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <Card className="rounded-2xl border-dashed shadow-sm">
      <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <ImageIcon className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="mb-4 max-w-md text-sm text-muted-foreground">{description}</p>
        {actionLabel && onAction ? <Button className="rounded-xl" onClick={onAction}>{actionLabel}</Button> : null}
      </CardContent>
    </Card>
  );
}

function formatDisplayDate(dateString) {
  if (!dateString) return 'No date';
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default PhotosPage;
