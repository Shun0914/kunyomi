import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Bell, Mail, MessageSquare } from 'lucide-react';

interface NotificationSettingsProps {
  onSave: (settings: NotificationSettings) => void;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  slackNotifications: boolean;
  discordNotifications: boolean;
  newQANotification: boolean;
  answerNotification: boolean;
  documentUpdateNotification: boolean;
  slackWebhookUrl: string;
  discordWebhookUrl: string;
}

export function NotificationSettings({ onSave }: NotificationSettingsProps) {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    slackNotifications: false,
    discordNotifications: false,
    newQANotification: true,
    answerNotification: true,
    documentUpdateNotification: false,
    slackWebhookUrl: '',
    discordWebhookUrl: '',
  });

  const handleSave = () => {
    onSave(settings);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          通知設定
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 通知チャネル */}
        <div>
          <h3 className="mb-4">通知チャネル</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <Label htmlFor="email-notif">メール通知</Label>
              </div>
              <Switch
                id="email-notif"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, emailNotifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <Label htmlFor="slack-notif">Slack通知</Label>
              </div>
              <Switch
                id="slack-notif"
                checked={settings.slackNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, slackNotifications: checked })
                }
              />
            </div>

            {settings.slackNotifications && (
              <div className="ml-6">
                <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
                <Input
                  id="slack-webhook"
                  type="url"
                  value={settings.slackWebhookUrl}
                  onChange={(e) =>
                    setSettings({ ...settings, slackWebhookUrl: e.target.value })
                  }
                  placeholder="https://hooks.slack.com/services/..."
                  className="mt-1"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <Label htmlFor="discord-notif">Discord通知</Label>
              </div>
              <Switch
                id="discord-notif"
                checked={settings.discordNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, discordNotifications: checked })
                }
              />
            </div>

            {settings.discordNotifications && (
              <div className="ml-6">
                <Label htmlFor="discord-webhook">Discord Webhook URL</Label>
                <Input
                  id="discord-webhook"
                  type="url"
                  value={settings.discordWebhookUrl}
                  onChange={(e) =>
                    setSettings({ ...settings, discordWebhookUrl: e.target.value })
                  }
                  placeholder="https://discord.com/api/webhooks/..."
                  className="mt-1"
                />
              </div>
            )}
          </div>
        </div>

        {/* 通知イベント */}
        <div>
          <h3 className="mb-4">通知イベント</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="new-qa-notif">新しい質問が投稿されたとき</Label>
              <Switch
                id="new-qa-notif"
                checked={settings.newQANotification}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, newQANotification: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="answer-notif">質問に回答があったとき</Label>
              <Switch
                id="answer-notif"
                checked={settings.answerNotification}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, answerNotification: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="doc-update-notif">ナレッジが更新されたとき</Label>
              <Switch
                id="doc-update-notif"
                checked={settings.documentUpdateNotification}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, documentUpdateNotification: checked })
                }
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">
          設定を保存
        </Button>
      </CardContent>
    </Card>
  );
}
