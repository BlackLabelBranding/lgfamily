
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MapPin } from 'lucide-react';

function EmergencyContactCard({ contact }) {
  return (
    <Card className="transition-all duration-200 hover:shadow-md border-2">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h4 className="font-semibold text-base mb-1">{contact.name}</h4>
            <Badge variant="secondary" className="bg-emergency-accent text-white">
              {contact.relationship}
            </Badge>
          </div>
          <Button 
            size="sm" 
            className="bg-emergency-accent hover:bg-emergency-accent/90 text-white gap-2 touch-target"
          >
            <Phone className="h-4 w-4" />
            Call now
          </Button>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span className="font-medium text-foreground">{contact.phone}</span>
          </div>
          {contact.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{contact.email}</span>
            </div>
          )}
          {contact.address && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{contact.address}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default EmergencyContactCard;
