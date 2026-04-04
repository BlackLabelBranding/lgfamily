
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Lock, AlertCircle, Eye, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

function DocumentCard({ document }) {
  const isExpiringSoon = document.expirationWarning;
  const isLocked = document.permission === 'Admin Only';

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      isExpiringSoon && "border-accent"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-medium text-sm">{document.title}</h4>
              {isLocked && <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
            </div>
            <div className="space-y-2">
              {document.expirationDate && (
                <div className="flex items-center gap-2 text-xs">
                  {isExpiringSoon && <AlertCircle className="h-3 w-3 text-accent" />}
                  <span className={cn(
                    "text-muted-foreground",
                    isExpiringSoon && "text-accent font-medium"
                  )}>
                    Expires: {document.expirationDate}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {document.permission}
                </Badge>
                {document.category && (
                  <Badge variant="outline" className="text-xs">
                    {document.category}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                <Eye className="h-3 w-3" />
                View
              </Button>
              <Button size="sm" variant="ghost" className="h-8 text-xs gap-1">
                <Download className="h-3 w-3" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DocumentCard;
