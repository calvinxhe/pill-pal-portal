import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

const RevenueTracking = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Revenue Tracking</h2>
        <p className="text-muted-foreground">Monitor transaction fees and earnings</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Revenue Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Revenue tracking coming soon...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueTracking;