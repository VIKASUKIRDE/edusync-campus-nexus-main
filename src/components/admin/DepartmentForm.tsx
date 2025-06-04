
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DepartmentFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  initialData?: any;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    head_name: initialData?.head_name || '',
    established_year: initialData?.established_year || new Date().getFullYear()
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Department' : 'Add New Department'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Department Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Computer Science"
              required
            />
          </div>
          <div>
            <Label htmlFor="head_name">Department Head</Label>
            <Input
              id="head_name"
              value={formData.head_name}
              onChange={(e) => setFormData({...formData, head_name: e.target.value})}
              placeholder="e.g., Dr. John Smith"
            />
          </div>
          <div>
            <Label htmlFor="established_year">Established Year</Label>
            <Input
              id="established_year"
              type="number"
              value={formData.established_year}
              onChange={(e) => setFormData({...formData, established_year: parseInt(e.target.value)})}
              min="1800"
              max={new Date().getFullYear()}
            />
          </div>
          <div className="flex space-x-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (initialData ? 'Update Department' : 'Add Department')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DepartmentForm;
