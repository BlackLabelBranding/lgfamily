
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Calendar } from 'lucide-react';

function FamilyMemberCard({ member }) {
  const roleColors = {
    parent: 'bg-primary text-primary-foreground',
    child: 'bg-secondary text-secondary-foreground',
    guardian: 'bg-accent text-accent-foreground',
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 rounded-xl">
            <AvatarFallback className="text-xl font-semibold bg-primary text-primary-foreground rounded-xl">
              {member.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <Badge className={roleColors[member.role] || 'bg-muted text-muted-foreground'}>
                  {member.role}
                </Badge>
              </div>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground mb-3">
              {member.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{member.email}</span>
                </div>
              )}
              {member.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{member.phone}</span>
                </div>
              )}
              {member.birthday && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{member.birthday}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-xs">
                View profile
              </Button>
              <Button size="sm" variant="ghost" className="text-xs">
                Edit
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default FamilyMemberCard;
