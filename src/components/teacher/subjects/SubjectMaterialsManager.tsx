
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, Image, File, Link } from 'lucide-react';

interface SubjectMaterialsManagerProps {
  subjectId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SubjectMaterialsManager: React.FC<SubjectMaterialsManagerProps> = ({
  subjectId,
  open,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file_type: '',
    file_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const fileTypes = [
    { value: 'pdf', label: 'PDF Document', icon: FileText, accept: '.pdf' },
    { value: 'pptx', label: 'PowerPoint', icon: FileText, accept: '.pptx,.ppt' },
    { value: 'docx', label: 'Word Document', icon: FileText, accept: '.docx,.doc' },
    { value: 'xlsx', label: 'Excel Spreadsheet', icon: FileText, accept: '.xlsx,.xls' },
    { value: 'jpg', label: 'Image (JPG)', icon: Image, accept: '.jpg,.jpeg' },
    { value: 'png', label: 'Image (PNG)', icon: Image, accept: '.png' },
    { value: 'mp4', label: 'Video (MP4)', icon: File, accept: '.mp4' },
    { value: 'url', label: 'Web Link', icon: Link, accept: '' }
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.type, file.size);
      setSelectedFile(file);
      
      // Auto-detect file type based on extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      const detectedType = fileTypes.find(type => 
        type.accept.includes(`.${extension}`)
      )?.value || 'file';
      
      setFormData(prev => ({
        ...prev,
        file_type: detectedType,
        title: prev.title || file.name.split('.')[0]
      }));
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      console.log('Starting file upload:', file.name);
      setUploadProgress(10);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `subject-materials/${subjectId}/${fileName}`;

      console.log('Uploading to path:', filePath);
      setUploadProgress(30);

      const { data, error: uploadError } = await supabase.storage
        .from('subject-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', data);
      setUploadProgress(80);

      const { data: { publicUrl } } = supabase.storage
        .from('subject-files')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);
      setUploadProgress(100);
      
      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setUploadProgress(0);
      toast({
        title: "Upload Error",
        description: `Failed to upload file: ${error.message}`,
        variant: "destructive",
      });
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let fileUrl = formData.file_url;
      let fileSize = null;

      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Material title is required');
      }

      if (!formData.file_type) {
        throw new Error('Material type is required');
      }

      // Upload file if selected
      if (selectedFile) {
        console.log('Uploading file:', selectedFile.name);
        fileUrl = await uploadFile(selectedFile);
        if (!fileUrl) {
          setLoading(false);
          return;
        }
        fileSize = selectedFile.size;
      } else if (formData.file_type !== 'url') {
        throw new Error('Please select a file to upload');
      } else if (!formData.file_url.trim()) {
        throw new Error('Please enter a valid URL');
      }

      console.log('Saving material to database with data:', {
        subject_id: subjectId,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        file_type: formData.file_type,
        file_url: fileUrl,
        file_size: fileSize
      });

      // Save material to database
      const { data, error } = await supabase
        .from('subject_materials')
        .insert({
          subject_id: subjectId,
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          file_type: formData.file_type,
          file_url: fileUrl,
          file_size: fileSize
        })
        .select();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Material saved successfully:', data);

      toast({
        title: "Success",
        description: "Material added successfully",
      });

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error adding material:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add material",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      file_type: '',
      file_url: ''
    });
    setSelectedFile(null);
    setUploadProgress(0);
    onClose();
  };

  const selectedFileType = fileTypes.find(type => type.value === formData.file_type);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-purple-900">
            Add Subject Material
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Material Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter material title"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the material content..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="file_type">Material Type *</Label>
            <Select 
              value={formData.file_type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, file_type: value }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select material type" />
              </SelectTrigger>
              <SelectContent>
                {fileTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center space-x-2">
                        <IconComponent className="h-4 w-4" />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {formData.file_type === 'url' ? (
            <div>
              <Label htmlFor="file_url">Web Link *</Label>
              <Input
                id="file_url"
                type="url"
                value={formData.file_url}
                onChange={(e) => setFormData(prev => ({ ...prev, file_url: e.target.value }))}
                placeholder="https://example.com/resource"
                required
                className="mt-1"
              />
            </div>
          ) : formData.file_type ? (
            <div>
              <Label htmlFor="file">Upload File *</Label>
              <div className="mt-1">
                <input
                  id="file"
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept={selectedFileType?.accept || '*'}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('file')?.click()}
                  className="w-full border-dashed border-2 border-purple-300 hover:border-purple-500 h-24"
                  disabled={loading}
                >
                  <div className="text-center">
                    <Upload className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                    <p className="text-sm text-purple-600">
                      {selectedFile ? selectedFile.name : `Click to upload ${selectedFileType?.label || 'file'}`}
                    </p>
                    {selectedFile && (
                      <p className="text-xs text-gray-500 mt-1">
                        Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </Button>
              </div>
            </div>
          ) : null}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || (!formData.file_url && !selectedFile && formData.file_type !== 'url')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Adding...' : 'Add Material'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubjectMaterialsManager;
