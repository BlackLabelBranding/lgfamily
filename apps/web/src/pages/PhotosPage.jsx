import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
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
  FolderOpen,
  ArrowLeft,
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

const initialAlbums = [
  {
    id: 'a1',
    name: 'Summer Lake Weekend',
    description: 'Swimming, grilling, and family time at the lake.',
    date: '2026-03-18',
    category: 'Vacation',
  },
  {
    id: 'a2',
    name: 'Christmas Morning 2025',
    description: 'Pajamas, presents, and coffee.',
    date: '2025-12-25',
    category: 'Holiday',
  },
  {
    id: 'a3',
    name: 'Zander Milestones',
    description: 'Big moments and proud achievements.',
    date: '2026-02-09',
    category: 'Milestone',
  },
];

const initialMemories = [
  {
    id: 'm1',
    title: 'Dock sunset',
    description: 'The lake was calm and the weather was perfect.',
    date: '2026-03-18',
    category: 'Vacation',
    people: ['Shelby', 'Zander', 'Kasper'],
    photo:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    type: 'album',
    albumId: 'a1',
  },
  {
    id: 'm2',
    title: 'Family by the water',
    description: 'Quick picture before dinner.',
    date: '2026-03-18',
    category: 'Vacation',
    people: ['Shelby', 'Zander'],
    photo:
      'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80',
    type: 'album',
    albumId: 'a1',
  },
  {
    id: 'm3',
    title: 'Christmas morning',
    description: 'The living room was full and loud in the best way.',
    date: '2025-12-25',
    category: 'Holiday',
    people: ['Shelby', 'Zander', 'Kasper'],
    photo:
      'https://images.unsplash.com/photo-1512389098783-66b81f86e199?auto=format&fit=crop&w=1200&q=80',
    type: 'album',
    albumId: 'a2',
  },
  {
    id: 'm4',
    title: 'Lost first tooth',
    description: 'Big milestone day and he was very proud of it.',
    date: '2026-02-09',
    category: 'Milestone',
    people: ['Zander', 'Shelby'],
    photo:
      'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=80',
    type: 'milestone',
    albumId: 'a3',
  },
  {
    id: 'm5',
    title: 'School paperwork scanned',
    description: 'Important school form saved for easy access later.',
    date: '2026-04-02',
    category: 'Document',
    people: ['Zander'],
    photo: '',
    type: 'scan',
    fileLabel: 'School enrollment form',
    albumId: '',
  },
];

const categories = [
  'Birthday',
  'Holiday',
  'Vacation',
  'School',
  'Milestone',
  'Everyday',
  'Document',
  'Sports',
  'Anniversary',
  'Other',
];

const emptyMemoryForm = {
  title: '',
  description: '',
  date: '',
  category: 'Everyday',
  people: [],
  photo: '',
  type: 'album',
  fileLabel: '',
  albumId: '',
};

const emptyBulkForm = {
  date: '',
  category: 'Everyday',
  people: [],
  type: 'album',
  description: '',
  files: [],
  albumId: '',
};

const emptyAlbumForm = {
  name: '',
  description: '',
  date: '',
  category: 'Everyday',
};

function PhotosPage() {
  const [familyMembers] = useState(initialFamilyMembers);
  const [albums, setAlbums] = useState(initialAlbums);
  const [memories, setMemories] = useState(initialMemories);

  const [activeTab, setActiveTab] = useState('albums');
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);

  const [isMemoryFormOpen, setIsMemoryFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isAlbumFormOpen, setIsAlbumFormOpen] = useState(false);

  const [editingMemory, setEditingMemory] = useState(null);
  const [selectedMemory, setSelectedMemory] = useState(null);

  const [memoryForm, setMemoryForm] = useState(emptyMemoryForm);
  const [bulkForm, setBulkForm] = useState(emptyBulkForm);
  const [albumForm, setAlbumForm] = useState(emptyAlbumForm);

  const [personFilter, setPersonFilter] = useState('All members');
  const [categoryFilter, setCategoryFilter] = useState('All categories');

  const sortedMemories = useMemo(() => {
    return [...memories].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [memories]);

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

  const albumsWithStats = useMemo(() => {
    return albums
      .map((album) => {
        const albumMemories = memories.filter((memory) => memory.albumId === album.id);
        const cover = albumMemories.find((memory) => memory.photo)?.photo || '';
        return {
          ...album,
          count: albumMemories.length,
          cover,
        };
      })
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [albums, memories]);

  const selectedAlbum = useMemo(() => {
    return albumsWithStats.find((album) => album.id === selectedAlbumId) || null;
  }, [albumsWithStats, selectedAlbumId]);

  const selectedAlbumMemories = useMemo(() => {
    if (!selectedAlbumId) return [];
    return sortedMemories.filter((memory) => memory.albumId === selectedAlbumId);
  }, [sortedMemories, selectedAlbumId]);

  function resetMemoryForm() {
    setMemoryForm(emptyMemoryForm);
    setEditingMemory(null);
  }

  function resetBulkForm() {
    setBulkForm(emptyBulkForm);
  }

  function resetAlbumForm() {
    setAlbumForm(emptyAlbumForm);
  }

  function openAddMemoryDialog(type = 'album', albumId = '') {
    setEditingMemory(null);
    setMemoryForm({
      ...emptyMemoryForm,
      type,
      albumId: albumId || selectedAlbumId || '',
      category: type === 'scan' ? 'Document' : type === 'milestone' ? 'Milestone' : 'Everyday',
    });
    setIsMemoryFormOpen(true);
  }

  function openEditMemoryDialog(memory) {
    setEditingMemory(memory);
    setMemoryForm({
      title: memory.title || '',
      description: memory.description || '',
      date: memory.date || '',
      category: memory.category || 'Everyday',
      people: memory.people || [],
      photo: memory.photo || '',
      type: memory.type || 'album',
      fileLabel: memory.fileLabel || '',
      albumId: memory.albumId || '',
    });
    setIsMemoryFormOpen(true);
  }

  function openDetailDialog(memory) {
    setSelectedMemory(memory);
    setIsDetailOpen(true);
  }

  function openBulkUploadDialog(albumId = '') {
    resetBulkForm();
    setBulkForm((prev) => ({
      ...prev,
      albumId: albumId || selectedAlbumId || '',
    }));
    setIsBulkUploadOpen(true);
  }

  function openAddAlbumDialog() {
    resetAlbumForm();
    setIsAlbumFormOpen(true);
  }

  function handleMemoryInputChange(field, value) {
    setMemoryForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleMemoryPerson(name) {
    setMemoryForm((prev) => {
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

  function handleBulkFilesChange(e) {
    const files = Array.from(e.target.files || []);
    setBulkForm((prev) => ({ ...prev, files }));
  }

  function handleSaveMemory(e) {
    e.preventDefault();

    if (!memoryForm.title.trim() || !memoryForm.date) return;

    const payload = {
      id: editingMemory?.id || `memory-${Date.now()}`,
      title: memoryForm.title.trim(),
      description: memoryForm.description.trim(),
      date: memoryForm.date,
      category: memoryForm.category,
      people: memoryForm.people,
      photo: memoryForm.photo.trim(),
      type: memoryForm.type,
      fileLabel: memoryForm.fileLabel.trim(),
      albumId: memoryForm.type === 'scan' ? '' : memoryForm.albumId || '',
    };

    if (editingMemory) {
      setMemories((prev) =>
        prev.map((memory) => (memory.id === editingMemory.id ? payload : memory))
      );
    } else {
      setMemories((prev) => [payload, ...prev]);
    }

    setIsMemoryFormOpen(false);
    resetMemoryForm();
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
      albumId: bulkForm.albumId || '',
    }));

    setMemories((prev) => [...newItems, ...prev]);
    setIsBulkUploadOpen(false);
    resetBulkForm();
  }

  function handleCreateAlbum(e) {
    e.preventDefault();

    if (!albumForm.name.trim()) return;

    const newAlbumId = `album-${Date.now()}`;
    const newAlbum = {
      id: newAlbumId,
      name: albumForm.name.trim(),
      description: albumForm.description.trim(),
      date: albumForm.date || new Date().toISOString().slice(0, 10),
      category: albumForm.category,
    };

    setAlbums((prev) => [newAlbum, ...prev]);
    setSelectedAlbumId(newAlbumId);
    setIsAlbumFormOpen(false);
    resetAlbumForm();
    setActiveTab('albums');
  }

  function handleDeleteMemory(id) {
    setMemories((prev) => prev.filter((memory) => memory.id !== id));
    if (selectedMemory?.id === id) {
      setSelectedMemory(null);
      setIsDetailOpen(false);
    }
  }

  function handleDeleteAlbum(albumId) {
    setMemories((prev) =>
      prev.map((memory) =>
        memory.albumId === albumId ? { ...memory, albumId: '' } : memory
      )
    );
    setAlbums((prev) => prev.filter((album) => album.id !== albumId));
    if (selectedAlbumId === albumId) {
      setSelectedAlbumId(null);
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
              <div className={`${square ? 'aspect-square' : 'aspect-video'} overflow-hidden bg-muted`}>
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
                onClick={() => openEditMemoryDialog(memory)}
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
        <meta
          name="description"
          content="Family photos, memories, milestones, and scanned documents"
        />
      </Helmet>

      <div className="space-y-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Photos & Memories</h2>
            <p className="text-muted-foreground">
              Preserve family moments, albums, milestones, and important records.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="gap-2 rounded-xl shadow-sm"
              onClick={() => openAddMemoryDialog('album')}
            >
              <Plus className="h-4 w-4" />
              Add memory
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="gap-2 rounded-xl"
              onClick={openAddAlbumDialog}
            >
              <FolderOpen className="h-4 w-4" />
              New album
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="gap-2 rounded-xl"
              onClick={() => openBulkUploadDialog()}
            >
              <Upload className="h-4 w-4" />
              Mass upload
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<FolderOpen className="h-5 w-5 text-muted-foreground" />}
            label="Albums"
            value={albums.length}
          />
          <StatCard
            icon={<ImageIcon className="h-5 w-5 text-muted-foreground" />}
            label="Memories"
            value={memories.filter((item) => item.type !== 'scan').length}
          />
          <StatCard
            icon={<Calendar className="h-5 w-5 text-muted-foreground" />}
            label="Milestones"
            value={milestones.length}
          />
          <StatCard
            icon={<FileText className="h-5 w-5 text-muted-foreground" />}
            label="Scans"
            value={scans.length}
          />
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
            {!selectedAlbum ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">Albums</h3>
                    <p className="text-sm text-muted-foreground">
                      Create albums from the front end and group memories together.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 rounded-xl"
                    onClick={openAddAlbumDialog}
                  >
                    <Plus className="h-4 w-4" />
                    New album
                  </Button>
                </div>

                {albumsWithStats.length ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {albumsWithStats.map((album) => (
                      <Card
                        key={album.id}
                        className="overflow-hidden rounded-2xl shadow-sm transition-all duration-200 hover:shadow-lg"
                      >
                        <CardContent className="p-0">
                          <button
                            type="button"
                            className="block w-full text-left"
                            onClick={() => setSelectedAlbumId(album.id)}
                          >
                            <div className="aspect-video overflow-hidden bg-muted">
                              {album.cover ? (
                                <img
                                  src={album.cover}
                                  alt={album.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <FolderOpen className="h-12 w-12 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          </button>

                          <div className="p-4">
                            <div className="mb-2 flex items-start justify-between gap-3">
                              <div>
                                <h4 className="font-semibold text-sm">{album.name}</h4>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {formatDisplayDate(album.date)}
                                </p>
                              </div>
                              <Badge variant="secondary" className="text-[11px]">
                                {album.category}
                              </Badge>
                            </div>

                            {album.description ? (
                              <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">
                                {album.description}
                              </p>
                            ) : null}

                            <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
                              <span>
                                {album.count} item{album.count === 1 ? '' : 's'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl"
                                onClick={() => setSelectedAlbumId(album.id)}
                              >
                                Open
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl text-destructive hover:text-destructive"
                                onClick={() => handleDeleteAlbum(album.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No albums yet"
                    description="Create your first album to organize family memories."
                    actionLabel="New album"
                    onAction={openAddAlbumDialog}
                  />
                )}
              </>
            ) : (
              <>
                <div className="rounded-2xl border bg-card p-4 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mb-2 gap-2 px-0 hover:bg-transparent"
                        onClick={() => setSelectedAlbumId(null)}
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back to albums
                      </Button>

                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-semibold">{selectedAlbum.name}</h3>
                        <Badge variant="secondary">{selectedAlbum.category}</Badge>
                      </div>

                      <p className="mb-2 text-sm text-muted-foreground">
                        {selectedAlbum.description || 'No description yet.'}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {formatDisplayDate(selectedAlbum.date)} • {selectedAlbum.count} item
                        {selectedAlbum.count === 1 ? '' : 's'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="gap-2 rounded-xl"
                        onClick={() => openAddMemoryDialog('album', selectedAlbum.id)}
                      >
                        <Plus className="h-4 w-4" />
                        Add memory
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 rounded-xl"
                        onClick={() => openBulkUploadDialog(selectedAlbum.id)}
                      >
                        <Upload className="h-4 w-4" />
                        Mass upload
                      </Button>
                    </div>
                  </div>
                </div>

                {selectedAlbumMemories.length ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {selectedAlbumMemories.map((memory) => renderMemoryCard(memory))}
                  </div>
                ) : (
                  <EmptyState
                    title="This album is empty"
                    description="Add a memory or use mass upload to fill this album."
                    actionLabel="Add memory"
                    onAction={() => openAddMemoryDialog('album', selectedAlbum.id)}
                  />
                )}
              </>
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
                  <Card
                    key={memory.id}
                    className="rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md"
                  >
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
                            <p className="mb-3 text-sm text-muted-foreground">
                              {memory.description}
                            </p>
                          ) : null}

                          <div className="mb-3 flex flex-wrap gap-1">
                            {memory.people.map((person) => (
                              <Badge
                                key={`${memory.id}-${person}`}
                                variant="outline"
                                className="text-[11px]"
                              >
                                {person}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl"
                              onClick={() => openDetailDialog(memory)}
                            >
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl"
                              onClick={() => openEditMemoryDialog(memory)}
                            >
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
                onAction={() => openAddMemoryDialog('milestone')}
              />
            )}
          </TabsContent>

          <TabsContent value="scans" className="space-y-4">
            {scans.length ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {scans.map((memory) => (
                  <Card
                    key={memory.id}
                    className="rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md"
                  >
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
                            <p className="text-xs text-muted-foreground">
                              {memory.fileLabel}
                            </p>
                          ) : null}

                          <p className="mt-1 text-xs text-muted-foreground">
                            Saved {formatDisplayDate(memory.date)}
                          </p>

                          <div className="mt-3 flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl"
                              onClick={() => openDetailDialog(memory)}
                            >
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl"
                              onClick={() => openEditMemoryDialog(memory)}
                            >
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
                onAction={() => openAddMemoryDialog('scan')}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog
        open={isAlbumFormOpen}
        onOpenChange={(open) => {
          setIsAlbumFormOpen(open);
          if (!open) resetAlbumForm();
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>New album</DialogTitle>
            <DialogDescription>
              Create a new album from the front end and start adding memories into it.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAlbum} className="space-y-5">
            <Field label="Album name" required>
              <input
                value={albumForm.name}
                onChange={(e) => setAlbumForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Example: Summer 2026"
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                required
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Date">
                <input
                  type="date"
                  value={albumForm.date}
                  onChange={(e) => setAlbumForm((prev) => ({ ...prev, date: e.target.value }))}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                />
              </Field>

              <Field label="Category">
                <select
                  value={albumForm.category}
                  onChange={(e) => setAlbumForm((prev) => ({ ...prev, category: e.target.value }))}
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
                value={albumForm.description}
                onChange={(e) =>
                  setAlbumForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Optional description for this album"
                className="min-h-[110px] w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </Field>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  setIsAlbumFormOpen(false);
                  resetAlbumForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl">
                Create album
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isMemoryFormOpen}
        onOpenChange={(open) => {
          setIsMemoryFormOpen(open);
          if (!open) resetMemoryForm();
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
                  value={memoryForm.title}
                  onChange={(e) => handleMemoryInputChange('title', e.target.value)}
                  placeholder="Memory title"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  required
                />
              </Field>

              <Field label="Date" required>
                <input
                  type="date"
                  value={memoryForm.date}
                  onChange={(e) => handleMemoryInputChange('date', e.target.value)}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  required
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Type">
                <select
                  value={memoryForm.type}
                  onChange={(e) => handleMemoryInputChange('type', e.target.value)}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="album">Album memory</option>
                  <option value="milestone">Milestone</option>
                  <option value="scan">Scan / document</option>
                </select>
              </Field>

              <Field label="Category">
                <select
                  value={memoryForm.category}
                  onChange={(e) => handleMemoryInputChange('category', e.target.value)}
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

            {memoryForm.type !== 'scan' ? (
              <Field label="Album">
                <div className="flex gap-2">
                  <select
                    value={memoryForm.albumId}
                    onChange={(e) => handleMemoryInputChange('albumId', e.target.value)}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="">No album</option>
                    {albumsWithStats.map((album) => (
                      <option key={album.id} value={album.id}>
                        {album.name}
                      </option>
                    ))}
                  </select>

                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={openAddAlbumDialog}
                  >
                    New
                  </Button>
                </div>
              </Field>
            ) : null}

            <Field label="Description">
              <textarea
                value={memoryForm.description}
                onChange={(e) => handleMemoryInputChange('description', e.target.value)}
                placeholder="Add the story behind this memory"
                className="min-h-[110px] w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </Field>

            {memoryForm.type === 'scan' ? (
              <Field label="Document label">
                <input
                  value={memoryForm.fileLabel}
                  onChange={(e) => handleMemoryInputChange('fileLabel', e.target.value)}
                  placeholder="Example: Birth certificate, school form, insurance card"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                />
              </Field>
            ) : (
              <Field label="Photo URL">
                <input
                  value={memoryForm.photo}
                  onChange={(e) => handleMemoryInputChange('photo', e.target.value)}
                  placeholder="Paste image URL for now"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                />
              </Field>
            )}

            <Field label="Tagged family members">
              <div className="flex flex-wrap gap-2">
                {familyMembers.map((member) => {
                  const active = memoryForm.people.includes(member.name);
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => toggleMemoryPerson(member.name)}
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
                  setIsMemoryFormOpen(false);
                  resetMemoryForm();
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
              Upload multiple photos at once using the same settings and album.
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

              <Field label="Album">
                <div className="flex gap-2">
                  <select
                    value={bulkForm.albumId}
                    onChange={(e) => setBulkForm((prev) => ({ ...prev, albumId: e.target.value }))}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="">No album</option>
                    {albumsWithStats.map((album) => (
                      <option key={album.id} value={album.id}>
                        {album.name}
                      </option>
                    ))}
                  </select>

                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={openAddAlbumDialog}
                  >
                    New
                  </Button>
                </div>
              </Field>
            </div>

            <Field label="Shared description">
              <textarea
                value={bulkForm.description}
                onChange={(e) =>
                  setBulkForm((prev) => ({ ...prev, description: e.target.value }))
                }
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
                {selectedMemory.albumId ? (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Album
                    </p>
                    <p className="text-sm">
                      {albums.find((album) => album.id === selectedMemory.albumId)?.name || 'Unknown'}
                    </p>
                  </div>
                ) : null}

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
                  onClick={() => openEditMemoryDialog(selectedMemory)}
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
        {actionLabel && onAction ? (
          <Button className="rounded-xl" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
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
