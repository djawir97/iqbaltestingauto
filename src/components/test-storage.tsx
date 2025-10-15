'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { saveWebhookUrl, getWebhookUrl, hasSavedWebhookUrl, clearWebhookUrl } from '@/lib/storage';

export default function TestStorage() {
  const [testUrl, setTestUrl] = useState('');
  const [savedUrl, setSavedUrl] = useState('');
  const [hasSaved, setHasSaved] = useState(false);

  const checkStorage = () => {
    setSavedUrl(getWebhookUrl() || 'Tidak ada URL tersimpan');
    setHasSaved(hasSavedWebhookUrl());
  };

  const saveTest = () => {
    if (testUrl.trim()) {
      saveWebhookUrl(testUrl);
      checkStorage();
    }
  };

  const clearTest = () => {
    clearWebhookUrl();
    checkStorage();
  };

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Test Local Storage</CardTitle>
        <CardDescription>Testing webhook URL storage functionality</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Test URL:</label>
          <Input
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="Masukkan URL untuk di-test"
          />
        </div>
        
        <div className="flex gap-2">
          <Button onClick={saveTest}>Simpan</Button>
          <Button onClick={checkStorage} variant="outline">Cek Storage</Button>
          <Button onClick={clearTest} variant="destructive">Hapus</Button>
        </div>
        
        <div className="bg-gray-50 p-4 rounded">
          <p><strong>URL Tersimpan:</strong> {savedUrl}</p>
          <p><strong>Has Saved:</strong> {hasSaved ? 'Ya' : 'Tidak'}</p>
        </div>
      </CardContent>
    </Card>
  );
}