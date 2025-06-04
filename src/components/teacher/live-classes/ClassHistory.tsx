
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  History,
  Calendar,
  Clock,
  Users,
  Video,
  ExternalLink,
  Search,
  Eye,
  Download,
  FileText
} from 'lucide-react';
import { LiveClass } from '@/hooks/useLiveClasses';

interface ClassHistoryProps {
  classes: LiveClass[];
}

const ClassHistory: React.FC<ClassHistoryProps> = ({ classes }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClasses = classes.filter(cls =>
    cls.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.semester.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.section.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01 ${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getPlatformIcon = (platform: string) => {
    const icons = {
      zoom: '📹',
      google_meet: '🎥',
      microsoft_teams: '👥',
      other: '🔗'
    };
    return icons[platform as keyof typeof icons] || '🔗';
  };

  const exportHistory = () => {
    const csvData = filteredClasses.map(cls => ({
      'Class Title': cls.title,
      'Subject': cls.subject_name || 'N/A',
      'Date': cls.class_date,
      'Start Time': cls.start_time,
      'End Time': cls.end_time,
      'Semester': cls.semester,
      'Section': cls.section,
      'Platform': cls.platform,
      'Status': cls.status,
      'Recording Available': cls.recording_link ? 'Yes' : 'No',
      'Meeting Link': cls.meeting_link
    }));

    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `class-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <History className="h-5 w-5 mr-2" />
              Class History
            </CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button onClick={exportHistory} variant="outline" disabled={filteredClasses.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Class History List */}
      {filteredClasses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <History className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchTerm ? 'No matching classes found' : 'No completed classes yet'}
            </h3>
            <p className="text-slate-500">
              {searchTerm 
                ? 'Try adjusting your search terms.'
                : 'Your completed classes will appear here after you finish conducting them.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredClasses.map((liveClass) => (
            <Card key={liveClass.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{liveClass.title}</h3>
                        {liveClass.subject_name && (
                          <p className="text-sm text-slate-600">
                            {liveClass.subject_name} ({liveClass.subject_code})
                          </p>
                        )}
                        {liveClass.description && (
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                            {liveClass.description}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary" className="ml-4">
                        ✅ Completed
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>{formatDate(liveClass.class_date)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span>
                          {formatTime(liveClass.start_time)} - {formatTime(liveClass.end_time)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Users className="h-4 w-4 text-slate-400" />
                        <span>{liveClass.semester} - Section {liveClass.section}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <span>{getPlatformIcon(liveClass.platform)}</span>
                        <span className="capitalize">{liveClass.platform.replace('_', ' ')}</span>
                      </div>
                    </div>

                    {/* Class Notes */}
                    {liveClass.notes && (
                      <div className="bg-slate-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <FileText className="h-4 w-4 text-slate-600" />
                          <span className="text-sm font-medium text-slate-700">Class Notes</span>
                        </div>
                        <p className="text-sm text-slate-600">{liveClass.notes}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3">
                      {liveClass.recording_link && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(liveClass.recording_link, '_blank')}
                        >
                          <Video className="h-4 w-4 mr-2" />
                          View Recording
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(liveClass.meeting_link, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Meeting Link
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // This would navigate to attendance view for this specific class
                          console.log('View attendance for class:', liveClass.id);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Attendance
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {filteredClasses.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-slate-900">{filteredClasses.length}</div>
                <p className="text-xs text-slate-600">Total Classes</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {filteredClasses.filter(cls => cls.recording_link).length}
                </div>
                <p className="text-xs text-slate-600">With Recordings</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {filteredClasses.filter(cls => cls.platform === 'zoom').length}
                </div>
                <p className="text-xs text-slate-600">Zoom Classes</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(filteredClasses.map(cls => `${cls.semester}-${cls.section}`)).size}
                </div>
                <p className="text-xs text-slate-600">Classes Taught</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClassHistory;
