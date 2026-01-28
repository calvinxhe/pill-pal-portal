import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Play, CheckCircle, Clock } from 'lucide-react';

const TrainingModules = () => {
  const modules = [
    {
      id: 1,
      title: 'HIPAA Compliance Training',
      description: 'Learn about HIPAA requirements and patient privacy protection',
      duration: '45 minutes',
      progress: 100,
      status: 'completed',
      isRequired: true,
      category: 'Compliance'
    },
    {
      id: 2,
      title: 'Device Fulfillment Process',
      description: 'Step-by-step guide to processing and shipping RPM devices',
      duration: '30 minutes',
      progress: 75,
      status: 'in_progress',
      isRequired: true,
      category: 'Operations'
    },
    {
      id: 3,
      title: 'Support Ticket Management',
      description: 'How to handle patient support requests effectively',
      duration: '25 minutes',
      progress: 0,
      status: 'not_started',
      isRequired: true,
      category: 'Customer Service'
    },
    {
      id: 4,
      title: 'Revenue Tracking System',
      description: 'Understanding the transaction fee structure and reporting',
      duration: '20 minutes',
      progress: 0,
      status: 'not_started',
      isRequired: false,
      category: 'Finance'
    },
    {
      id: 5,
      title: 'Platform Navigation',
      description: 'Getting familiar with the pharmacy portal interface',
      duration: '15 minutes',
      progress: 50,
      status: 'in_progress',
      isRequired: false,
      category: 'Platform'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'not_started':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'not_started':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const completedModules = modules.filter(m => m.status === 'completed').length;
  const totalRequired = modules.filter(m => m.isRequired).length;
  const completedRequired = modules.filter(m => m.isRequired && m.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Training & Platform Orientation</h2>
        <p className="text-muted-foreground">
          Complete training modules to improve your skills and compliance
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedModules}/{modules.length}</div>
            <p className="text-xs text-muted-foreground">modules completed</p>
            <Progress value={(completedModules / modules.length) * 100} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Required Training</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedRequired}/{totalRequired}</div>
            <p className="text-xs text-muted-foreground">required modules done</p>
            <Progress value={(completedRequired / totalRequired) * 100} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certification Status</CardTitle>
            <Badge variant={completedRequired === totalRequired ? "default" : "secondary"}>
              {completedRequired === totalRequired ? "Certified" : "In Progress"}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedRequired === totalRequired ? "Complete" : "Pending"}
            </div>
            <p className="text-xs text-muted-foreground">
              {completedRequired === totalRequired 
                ? "All required training completed" 
                : `${totalRequired - completedRequired} modules remaining`
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Training Modules */}
      <div className="grid gap-4">
        {modules.map((module) => (
          <Card key={module.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${getStatusColor(module.status)} text-white`}>
                    {getStatusIcon(module.status)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {module.isRequired && (
                    <Badge variant="destructive">Required</Badge>
                  )}
                  <Badge variant="outline">{module.category}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Duration: {module.duration}</p>
                    {module.progress > 0 && (
                      <div className="flex items-center space-x-2 mt-1">
                        <Progress value={module.progress} className="w-32" />
                        <span className="text-sm text-muted-foreground">{module.progress}%</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  {module.status === 'completed' ? (
                    <Button variant="outline" disabled>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Completed
                    </Button>
                  ) : (
                    <Button>
                      <Play className="h-4 w-4 mr-2" />
                      {module.status === 'in_progress' ? 'Continue' : 'Start'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TrainingModules;