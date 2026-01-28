import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, FileText } from 'lucide-react';

const KnowledgeBase = () => {
  const articles = [
    { id: 1, title: 'How to Ship RPM Devices', category: 'Device Fulfillment', tags: ['shipping', 'devices'] },
    { id: 2, title: 'Troubleshooting Device Setup', category: 'Patient Support', tags: ['troubleshooting', 'setup'] },
    { id: 3, title: 'Insurance Billing Guidelines', category: 'Billing', tags: ['insurance', 'billing'] },
    { id: 4, title: 'Patient Privacy Best Practices', category: 'Compliance', tags: ['hipaa', 'privacy'] },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Knowledge Base</h2>
        <p className="text-muted-foreground">Browse searchable FAQs and guides</p>
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search articles..." className="pl-8" />
      </div>

      <div className="grid gap-4">
        {articles.map((article) => (
          <Card key={article.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                </div>
                <Badge variant="outline">{article.category}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default KnowledgeBase;