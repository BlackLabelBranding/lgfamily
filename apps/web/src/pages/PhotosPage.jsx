
import React from 'react';
import { Helmet } from 'react-helmet';
import Sidebar from '@/components/Sidebar.jsx';
import Header from '@/components/Header.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Image as ImageIcon, Users, Calendar, FileText } from 'lucide-react';

function PhotosPage() {
  const albums = [
    { id: 1, name: "Summer vacation 2025", count: 127, date: "Jul 2025", cover: "🏖️" },
    { id: 2, name: "Emma's 12th birthday", count: 43, date: "Sep 2025", cover: "🎂" },
    { id: 3, name: "Family holidays 2025", count: 89, date: "Dec 2025", cover: "🎄" },
    { id: 4, name: "Lucas's school play", count: 31, date: "Mar 2026", cover: "🎭" },
  ];

  const milestones = [
    { id: 1, title: "Emma's first day of 7th grade", date: "Sep 2025", type: "School" },
    { id: 2, title: "Lucas learned to ride a bike", date: "Jun 2025", type: "Achievement" },
    { id: 3, title: "Family trip to Grand Canyon", date: "Jul 2025", type: "Travel" },
  ];

  return (
    <>
      <Helmet>
        <title>Photos & Memories - FamilyHub</title>
        <meta name="description" content="Family photo albums, milestones, and scanned documents" />
      </Helmet>
      
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <Header />
          <main className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2" style={{letterSpacing: '-0.02em'}}>Photos & memories</h1>
                  <p className="text-muted-foreground">Preserve family moments</p>
                </div>
                <Button className="gap-2 touch-target">
                  <Plus className="h-4 w-4" />
                  Upload photos
                </Button>
              </div>

              <Tabs defaultValue="albums" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                  <TabsTrigger value="albums" className="text-xs sm:text-sm">Albums</TabsTrigger>
                  <TabsTrigger value="by-person" className="text-xs sm:text-sm">By person</TabsTrigger>
                  <TabsTrigger value="milestones" className="text-xs sm:text-sm">Milestones</TabsTrigger>
                  <TabsTrigger value="scans" className="text-xs sm:text-sm">Scans</TabsTrigger>
                </TabsList>

                <TabsContent value="albums" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {albums.map(album => (
                      <Card key={album.id} className="transition-all duration-200 hover:shadow-lg cursor-pointer">
                        <CardContent className="p-0">
                          <div className="aspect-video bg-muted flex items-center justify-center text-6xl rounded-t-lg">
                            {album.cover}
                          </div>
                          <div className="p-4">
                            <h4 className="font-semibold text-sm mb-2">{album.name}</h4>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{album.count} photos</span>
                              <span>{album.date}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="by-person" className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-6">
                    <Button variant="outline" size="sm">All members</Button>
                    <Button variant="outline" size="sm">Sarah</Button>
                    <Button variant="outline" size="sm">Michael</Button>
                    <Button variant="outline" size="sm">Emma</Button>
                    <Button variant="outline" size="sm">Lucas</Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }, (_, i) => (
                      <Card key={i} className="transition-all duration-200 hover:shadow-md cursor-pointer">
                        <CardContent className="p-0">
                          <div className="aspect-square bg-muted flex items-center justify-center rounded-lg">
                            <ImageIcon className="h-12 w-12 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="milestones" className="space-y-4">
                  <div className="space-y-4">
                    {milestones.map(milestone => (
                      <Card key={milestone.id} className="transition-all duration-200 hover:shadow-md">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              <Calendar className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm mb-2">{milestone.title}</h4>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">{milestone.type}</Badge>
                                <span className="text-xs text-muted-foreground">{milestone.date}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="scans" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }, (_, i) => (
                      <Card key={i} className="transition-all duration-200 hover:shadow-md">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm mb-1">Scanned document {i + 1}</h4>
                              <p className="text-xs text-muted-foreground">Uploaded Apr {i + 1}, 2026</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default PhotosPage;
