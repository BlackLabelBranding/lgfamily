
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Clock, MapPin, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

function EventCard({ event }) {
  const eventTypeColors = {
    appointment: 'border-l-4 border-l-primary',
    activity: 'border-l-4 border-l-secondary',
    school: 'border-l-4 border-l-accent',
    family: 'border-l-4 border-l-destructive',
  };

  return (
    <Card className={cn(
      "p-4 transition-all duration-200 hover:shadow-md",
      eventTypeColors[event.type] || 'border-l-4 border-l-muted'
    )}>
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">{event.title}</h4>
            <Badge variant="secondary" className="text-xs">
              {event.type}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>{event.time}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              <span>{event.location}</span>
            </div>
          )}
          {event.attendees && event.attendees.length > 0 && (
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3" />
              <div className="flex items-center gap-1">
                {event.attendees.map((attendee, index) => (
                  <Avatar key={index} className="h-5 w-5">
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {attendee.initials}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default EventCard;
