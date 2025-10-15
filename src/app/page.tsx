'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, Video, Image, User, Film, Settings, Loader2, Save, RotateCcw, Check, Users } from 'lucide-react';
import { saveWebhookUrl, getWebhookUrl, hasSavedWebhookUrl, getUserSettings } from '@/lib/storage';

interface UploadedFile {
  file: File;
  preview: string;
}

interface SocialAccount {
  id: string;
  name: string;
  platform: 'tiktok' | 'instagram' | 'facebook';
}

const SOCIAL_ACCOUNTS: SocialAccount[] = [
  // TikTok Accounts
  {
    id: '68e5cfe074c8d32cce313b8e',
    name: 'Dokter Gaul',
    platform: 'tiktok'
  },
  {
    id: '68e5cf1974c8d32cce31390d',
    name: 'Kakek Gen Z',
    platform: 'tiktok'
  },
  // Instagram Accounts
  {
    id: 'ig_doktergaul_12345',
    name: 'Dokter Gaul IG',
    platform: 'instagram'
  },
  {
    id: 'ig_kakekgenz_67890',
    name: 'Kakek Gen Z IG',
    platform: 'instagram'
  },
  // Facebook Accounts
  {
    id: 'fb_doktergaul_official',
    name: 'Dokter Gaul Official',
    platform: 'facebook'
  },
  {
    id: 'fb_kakekgenz_page',
    name: 'Kakek Gen Z Page',
    platform: 'facebook'
  }
];

const PLATFORMS = [
  { value: 'tiktok', label: 'TikTok' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' }
] as const;

export default function Home() {
  const defaultWebhookUrl = 'https://n8n-n8n.avnlfb.easypanel.host/webhook-test/ec2b418d-967e-435d-9c24-c1c560b78d76';
  const [webhookUrl, setWebhookUrl] = useState(defaultWebhookUrl);
  const [hasSavedUrl, setHasSavedUrl] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // User ID states
  const [selectedPlatform, setSelectedPlatform] = useState<'tiktok' | 'instagram' | 'facebook'>('tiktok');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [manualUserId, setManualUserId] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);
  
  const [backgroundVideo, setBackgroundVideo] = useState<UploadedFile | null>(null);
  const [frame, setFrame] = useState<UploadedFile | null>(null);
  const [avatarAI, setAvatarAI] = useState<UploadedFile | null>(null);
  const [promoFootage, setPromoFootage] = useState<UploadedFile | null>(null);
  const [textDubbingVideo, setTextDubbingVideo] = useState('');
  const [textDubbingPromoVideo, setTextDubbingPromoVideo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Constants for duration estimation
  const WORDS_PER_MINUTE = 150; // Average reading speed
  const SECONDS_PER_WORD = 60 / WORDS_PER_MINUTE;

  // Function to estimate text duration in seconds
  const estimateTextDuration = (text: string): number => {
    if (!text.trim()) return 0;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words * SECONDS_PER_WORD);
  };

  // Function to format seconds to readable format
  const formatDuration = (seconds: number): string => {
    if (seconds === 0) return '0 detik';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return remainingSeconds > 0 
        ? `${minutes} menit ${remainingSeconds} detik`
        : `${minutes} menit`;
    }
    return `${remainingSeconds} detik`;
  };

  // Calculate durations
  const videoDuration = estimateTextDuration(textDubbingVideo);
  const promoDuration = estimateTextDuration(textDubbingPromoVideo);
  const totalDuration = videoDuration + promoDuration;

  // Load saved webhook URL on component mount
  useEffect(() => {
    const savedUrl = getWebhookUrl();
    if (savedUrl) {
      setWebhookUrl(savedUrl);
      setHasSavedUrl(true);
    }
  }, []);

  // Check save status when URL changes
  useEffect(() => {
    const saved = hasSavedWebhookUrl();
    const currentSaved = getWebhookUrl();
    setHasSavedUrl(saved && currentSaved === webhookUrl);
  }, [webhookUrl, hasSavedUrl]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      const uploadedFile = { file, preview };

      switch (type) {
        case 'background':
          setBackgroundVideo(uploadedFile);
          break;
        case 'frame':
          setFrame(uploadedFile);
          break;
        case 'avatar':
          setAvatarAI(uploadedFile);
          break;
        case 'promo':
          setPromoFootage(uploadedFile);
          break;
      }
    };

    if (file.type.startsWith('video/')) {
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (type: string) => {
    switch (type) {
      case 'background':
        setBackgroundVideo(null);
        break;
      case 'frame':
        setFrame(null);
        break;
      case 'avatar':
        setAvatarAI(null);
        break;
      case 'promo':
        setPromoFootage(null);
        break;
    }
  };

  const handleSaveWebhookUrl = async () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "Error",
        description: "Webhook URL tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      saveWebhookUrl(webhookUrl);
      setHasSavedUrl(true);
      setSaveSuccess(true);
      
      toast({
        title: "Berhasil Disimpan!",
        description: "Webhook URL telah disimpan secara lokal",
      });

      // Reset success indicator after 2 seconds
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan webhook URL",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetWebhookUrl = () => {
    setWebhookUrl(defaultWebhookUrl);
    setHasSavedUrl(false);
    setSaveSuccess(false);
    
    toast({
      title: "Reset Berhasil",
      description: "Webhook URL telah dikembalikan ke default",
    });
  };

  const getUserId = () => {
    return isManualMode ? manualUserId : selectedUserId;
  };

  const handleUserIdChange = (value: string) => {
    if (value === 'manual') {
      setIsManualMode(true);
      setSelectedUserId('');
    } else {
      setIsManualMode(false);
      setSelectedUserId(value);
      setManualUserId('');
    }
  };

  const handlePlatformChange = (platform: 'tiktok' | 'instagram' | 'facebook') => {
    setSelectedPlatform(platform);
    setSelectedUserId('');
    setManualUserId('');
    setIsManualMode(false);
  };

  const getAccountsByPlatform = () => {
    return SOCIAL_ACCOUNTS.filter(account => account.platform === selectedPlatform);
  };

  const getSelectedAccountInfo = () => {
    if (isManualMode) {
      return { name: manualUserId, id: manualUserId, platform: selectedPlatform };
    }
    const account = SOCIAL_ACCOUNTS.find(acc => acc.id === selectedUserId);
    return account || { name: '', id: '', platform: selectedPlatform };
  };

  const getFilteredAccounts = () => {
    return SOCIAL_ACCOUNTS.filter(account => account.platform === selectedPlatform);
  };

  const getSelectedAccountName = () => {
    if (isManualMode) return manualUserId;
    const account = SOCIAL_ACCOUNTS.find(acc => acc.id === selectedUserId);
    return account?.name || '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!backgroundVideo) {
      toast({
        title: "Error",
        description: "Video background wajib diupload",
        variant: "destructive",
      });
      return;
    }

    const currentUserId = getUserId();
    if (!currentUserId) {
      toast({
        title: "Error",
        description: "User ID wajib diisi",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('webhookUrl', webhookUrl);
      formData.append('userId', currentUserId);
      formData.append('platform', selectedPlatform);
      formData.append('backgroundVideo', backgroundVideo.file);
      
      if (frame) {
        formData.append('frame', frame.file);
      }
      if (avatarAI) {
        formData.append('avatarAI', avatarAI.file);
      }
      if (promoFootage) {
        formData.append('promoFootage', promoFootage.file);
      }
      if (textDubbingVideo.trim()) {
        formData.append('textDubbingVideo', textDubbingVideo);
      }
      if (textDubbingPromoVideo.trim()) {
        formData.append('textDubbingPromoVideo', textDubbingPromoVideo);
      }

      const response = await fetch('/api/autoediting', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Gagal mengirim data ke webhook');
      }

      const result = await response.json();
      
      toast({
        title: "Berhasil!",
        description: `${result.payload?.filesCount || 0} file telah dikirim untuk proses autoediting`,
      });

      // Log detail untuk debugging
      console.log('=== AutoEditing Response ===');
      console.log('Success:', result.success);
      console.log('User ID:', currentUserId);
      console.log('Files sent:', result.payload?.filesCount || 0);
      console.log('Submitted columns:', result.payload?.submittedColumns || []);
      console.log('File details:', result.payload?.files || {});
      console.log('Webhook response:', result.webhookResponse);
      console.log('==========================');

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const FileUploadCard = ({ 
    title, 
    description, 
    icon: Icon, 
    file, 
    onUpload, 
    onRemove, 
    required = false,
    accept 
  }: {
    title: string;
    description: string;
    icon: any;
    file: UploadedFile | null;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: () => void;
    required?: boolean;
    accept: string;
  }) => (
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
              <p className="text-sm text-muted-foreground truncate">
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-4">
            <img
              src="/autoediting-logo.png"
              alt="AutoEditing Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AutoEditing Video
          </h1>
          <p className="text-gray-600">
            Upload video dan assets untuk proses editing otomatis
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Webhook Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Konfigurasi Webhook
                {hasSavedUrl && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Tersimpan
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                URL webhook n8n untuk proses autoediting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="webhook" className="text-sm font-medium">Webhook URL</label>
                  <Input
                    id="webhook"
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://n8n-n8n.avnlfb.easypanel.host/webhook-test/..."
                    required
                    className={hasSavedUrl ? "border-green-200 focus:border-green-400" : ""}
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    onClick={handleSaveWebhookUrl}
                    disabled={isSaving || !webhookUrl.trim()}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                    size="default"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : saveSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        Tersimpan!
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Simpan Webhook URL
                      </>
                    )}
                  </Button>
                  
                  {hasSavedUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="default"
                      onClick={handleResetWebhookUrl}
                      className="flex items-center gap-2 border-gray-300 hover:border-gray-400"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset ke Default
                    </Button>
                  )}
                </div>
                
                {!hasSavedUrl && webhookUrl !== defaultWebhookUrl && (
                  <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 p-2 rounded flex items-center gap-2">
                    <Save className="w-3 h-3" />
                    Perubahan webhook URL belum disimpan. Klik "Simpan Webhook URL" untuk menyimpan perubahan.
                  </div>
                )}
                
                {hasSavedUrl && (
                  <div className="text-xs text-green-600 bg-green-50 border border-green-200 p-2 rounded flex items-center gap-2">
                    <Check className="w-3 h-3" />
                    Webhook URL tersimpan secara lokal di browser Anda dan akan otomatis dimuat saat halaman dibuka kembali.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* User ID Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Konfigurasi Akun Social Media
              </CardTitle>
              <CardDescription>
                Pilih platform dan akun yang akan digunakan untuk proses autoediting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Platform Selection */}
                <div className="space-y-2">
                  <label htmlFor="platform" className="text-sm font-medium">Pilih Platform</label>
                  <Select value={selectedPlatform} onValueChange={handlePlatformChange}>
                    <SelectTrigger id="platform">
                      <SelectValue placeholder="Pilih platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((platform) => (
                        <SelectItem key={platform.value} value={platform.value}>
                          {platform.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Account Selection */}
                <div className="space-y-2">
                  <label htmlFor="account" className="text-sm font-medium">Pilih Akun {selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}</label>
                  <Select 
                    value={isManualMode ? 'manual' : selectedUserId} 
                    onValueChange={handleUserIdChange}
                    disabled={getAccountsByPlatform().length === 0 && !isManualMode}
                  >
                    <SelectTrigger id="account">
                      <SelectValue placeholder={
                        getAccountsByPlatform().length === 0 
                          ? `Tidak ada akun ${selectedPlatform} tersedia` 
                          : `Pilih akun ${selectedPlatform} atau input manual`
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {getAccountsByPlatform().map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="manual">
                        <span className="text-blue-600">+ Input Manual User ID</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {isManualMode && (
                  <div className="space-y-2">
                    <label htmlFor="manualUserId" className="text-sm font-medium">User ID Manual</label>
                    <Input
                      id="manualUserId"
                      type="text"
                      value={manualUserId}
                      onChange={(e) => setManualUserId(e.target.value)}
                      placeholder={`Masukkan User ID ${selectedPlatform} secara manual`}
                      className="border-blue-200 focus:border-blue-400"
                    />
                    <p className="text-xs text-gray-500">
                      Masukkan User ID {selectedPlatform} yang akan digunakan untuk proses autoediting
                    </p>
                  </div>
                )}
                
                {/* Selected Account Info */}
                {!isManualMode && selectedUserId && (
                  <div className="text-xs text-green-600 bg-green-50 border border-green-200 p-2 rounded flex items-center gap-2">
                    <Check className="w-3 h-3" />
                    Akun terpilih: {getSelectedAccountInfo().name} ({selectedPlatform.toUpperCase()})
                  </div>
                )}
                
                {isManualMode && manualUserId && (
                  <div className="text-xs text-blue-600 bg-blue-50 border border-blue-200 p-2 rounded flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    User ID manual {selectedPlatform.toUpperCase()}: {manualUserId}
                  </div>
                )}

                {getAccountsByPlatform().length === 0 && !isManualMode && (
                  <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 p-2 rounded flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    Belum ada akun {selectedPlatform} yang tersedia. Gunakan input manual untuk menambahkan akun.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* File Uploads */}
          <div className="grid gap-6 md:grid-cols-2">
            <FileUploadCard
              title="Video Background"
              description="Upload video background (wajib)"
              icon={Video}
              file={backgroundVideo}
              onUpload={(e) => handleFileUpload(e, 'background')}
              onRemove={() => removeFile('background')}
              required={true}
              accept="video/*"
            />

            <FileUploadCard
              title="Frame"
              description="Upload frame (opsional)"
              icon={Image}
              file={frame}
              onUpload={(e) => handleFileUpload(e, 'frame')}
              onRemove={() => removeFile('frame')}
              required={false}
              accept="image/*"
            />

            <FileUploadCard
              title="Avatar AI"
              description="Upload avatar AI (opsional)"
              icon={User}
              file={avatarAI}
              onUpload={(e) => handleFileUpload(e, 'avatar')}
              onRemove={() => removeFile('avatar')}
              required={false}
              accept="image/*"
            />

            <FileUploadCard
              title="Footage Promo"
              description="Upload footage promo (opsional)"
              icon={Film}
              file={promoFootage}
              onUpload={(e) => handleFileUpload(e, 'promo')}
              onRemove={() => removeFile('promo')}
              required={false}
              accept="video/*"
            />

            {/* Text Dubbing Fields */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Text Dubbing (Opsional)
                </CardTitle>
                <CardDescription>
                  Teks untuk dubbing video dan promo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="textDubbingVideo" className="text-sm font-medium">
                    Text Dubbing Video
                  </label>
                  <Textarea
                    id="textDubbingVideo"
                    value={textDubbingVideo}
                    onChange={(e) => setTextDubbingVideo(e.target.value)}
                    placeholder="Masukkan teks untuk dubbing video (opsional)"
                    rows={3}
                    className="resize-none"
                  />
                  {textDubbingVideo.trim() && (
                    <div className="text-xs text-muted-foreground bg-blue-50 border border-blue-200 rounded p-2">
                      <div className="flex items-center justify-between">
                        <span>Estimasi durasi:</span>
                        <span className="font-medium text-blue-700">{formatDuration(videoDuration)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span>Jumlah kata:</span>
                        <span className="font-medium">{textDubbingVideo.trim().split(/\s+/).length} kata</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="textDubbingPromoVideo" className="text-sm font-medium">
                    Text Dubbing Promo Video
                  </label>
                  <Textarea
                    id="textDubbingPromoVideo"
                    value={textDubbingPromoVideo}
                    onChange={(e) => setTextDubbingPromoVideo(e.target.value)}
                    placeholder="Masukkan teks untuk dubbing promo video (opsional)"
                    rows={3}
                    className="resize-none"
                  />
                  {textDubbingPromoVideo.trim() && (
                    <div className="text-xs text-muted-foreground bg-green-50 border border-green-200 rounded p-2">
                      <div className="flex items-center justify-between">
                        <span>Estimasi durasi:</span>
                        <span className="font-medium text-green-700">{formatDuration(promoDuration)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span>Jumlah kata:</span>
                        <span className="font-medium">{textDubbingPromoVideo.trim().split(/\s+/).length} kata</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Total Duration Summary */}
                {(textDubbingVideo.trim() || textDubbingPromoVideo.trim()) && (
                  <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="text-sm font-medium text-purple-900 mb-2">
                      📊 Ringkasan Durasi Total
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-purple-700">Text Dubbing Video:</span>
                        <span className="font-medium text-purple-900">{formatDuration(videoDuration)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-700">Text Dubbing Promo Video:</span>
                        <span className="font-medium text-purple-900">{formatDuration(promoDuration)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-purple-300">
                        <span className="font-medium text-purple-900">Total Durasi:</span>
                        <span className="font-bold text-purple-900">{formatDuration(totalDuration)}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-purple-600">
                      💬 Berdasarkan kecepatan baca {WORDS_PER_MINUTE} kata/menit
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting || !backgroundVideo}
              className="min-w-48"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Mulai AutoEditing'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}