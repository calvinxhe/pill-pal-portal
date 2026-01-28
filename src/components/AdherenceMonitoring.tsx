import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

const AdherenceMonitoring = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Patient Adherence</h2>
        <p className="text-muted-foreground">Monitor patient device usage and compliance</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Adherence Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Adherence monitoring coming soon...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdherenceMonitoring;