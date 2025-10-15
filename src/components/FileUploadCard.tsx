import { Button } from '@/components/ui/button-minimal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-minimal';
import { Upload } from 'lucide-react';

interface UploadedFile {
  file: File;
  preview: string;
}

interface FileUploadCardProps {
  title: string;
  description: string;
  icon: any;
  file: UploadedFile | null;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  required?: boolean;
  accept: string;
}

export function FileUploadCard({ 
  title, 
  description, 
  icon: Icon, 
  file, 
  onUpload, 
  onRemove, 
  required = false,
  accept 
}: FileUploadCardProps) {
  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          {title}
          {required && <span className="text-red-500">*</span>}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {file ? (
          <div className="space-y-4">
            {file.file.type.startsWith('video/') ? (
              <video 
                src={file.preview} 
                controls 
                className="w-full max-h-48 rounded-lg object-cover"
              />
            ) : (
              <img 
                src={file.preview} 
                alt="Preview" 
                className="w-full max-h-48 rounded-lg object-cover"
              />
            )}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 truncate">
                {file.file.name}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRemove}
              >
                Hapus
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              id={title}
              accept={accept}
              onChange={onUpload}
              className="hidden"
            />
            <label
              htmlFor={title}
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-600">
                Klik untuk upload {title.toLowerCase()}
              </span>
            </label>
          </div>
        )}
      </CardContent>
    </Card>
  );
}