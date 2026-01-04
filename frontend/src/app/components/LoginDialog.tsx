import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { User } from '../types/knowledge';

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  users: User[];
}

export function LoginDialog({ open, onClose, onLogin, users }: LoginDialogProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    const user = users.find((u) => u.email === email);
    if (user) {
      onLogin(user);
      setEmail('');
      setError('');
      onClose();
    } else {
      setError('ユーザーが見つかりません');
    }
  };

  const handleQuickLogin = (user: User) => {
    onLogin(user);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ログイン</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="example@company.com"
            />
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          </div>
          <Button onClick={handleLogin} className="w-full">
            ログイン
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">または</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">クイックログイン（デモ用）:</p>
            {users.map((user) => (
              <Button
                key={user.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleQuickLogin(user)}
              >
                <div className="text-left">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-gray-500">
                    {user.email} - {user.department}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
