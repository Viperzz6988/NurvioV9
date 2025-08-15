import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Users, Gamepad2, Settings, FileText, Shield, Ban, UserCheck, Trophy, Lock, Unlock } from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
  last_login: string | null;
  banned: boolean;
  role: string;
}

interface LeaderboardEntry {
  user_id: string;
  username: string;
  game: string;
  score: number;
  created_at: string;
  updated_at: string;
}

interface AuditLog {
  id: number;
  user_id: string | null;
  actor_user_id: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: any;
  created_at: string;
  target_username: string | null;
  actor_username: string | null;
}

interface PageLock {
  pageKey: string;
  lockedForMembers: boolean;
  lockedMessageEn: string;
  lockedMessageDe: string;
  updatedAt: string;
}

interface DashboardStats {
  users: number;
  bannedUsers: number;
  leaderboardEntries: number;
  gamesTracked: string[];
  blackjackBalances: number;
}

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dashboard
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // User Management
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [userDropdown, setUserDropdown] = useState<{id: string, username: string}[]>([]);

  // Game Management
  const [leaderboards, setLeaderboards] = useState<LeaderboardEntry[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>('Blackjack');

  // Settings
  const [pageLocks, setPageLocks] = useState<PageLock[]>([]);
  const [newPageKey, setNewPageKey] = useState<string>('');

  // Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [logFilters, setLogFilters] = useState({
    dateFrom: '',
    dateTo: '',
    game: '',
    userId: ''
  });

  const isAdmin = user?.role === 'admin';

  // Auto-refresh timer
  useEffect(() => {
    if (!isAdmin) return;

    const refreshData = () => {
      if (activeTab === 'dashboard') loadStats();
      if (activeTab === 'users') loadUsers();
      if (activeTab === 'games') loadLeaderboards();
      if (activeTab === 'logs') loadAuditLogs();
    };

    const interval = setInterval(refreshData, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, [isAdmin, activeTab]);

  // Initial load
  useEffect(() => {
    if (isAdmin) {
      loadStats();
      loadUsers();
      loadUserDropdown();
      loadLeaderboards();
      loadPageLocks();
      loadAuditLogs();
    }
  }, [isAdmin]);

  const loadStats = async () => {
    try {
      const { data } = await api<{success: boolean, data: DashboardStats}>('/admin/stats');
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadUsers = async () => {
    try {
      const { data } = await api<User[]>('/admin/users');
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const loadUserDropdown = async () => {
    try {
      const { data } = await api<{id: string, username: string}[]>('/admin/users/select-list');
      setUserDropdown(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load user dropdown:', err);
    }
  };

  const loadLeaderboards = async () => {
    try {
      const { data } = await api<LeaderboardEntry[]>(`/admin/leaderboard/${selectedGame}`);
      setLeaderboards(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load leaderboards:', err);
    }
  };

  const loadPageLocks = async () => {
    try {
      const { data } = await api<PageLock[]>('/admin/settings/pages');
      setPageLocks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load page locks:', err);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (logFilters.dateFrom) params.append('dateFrom', logFilters.dateFrom);
      if (logFilters.dateTo) params.append('dateTo', logFilters.dateTo);
      if (logFilters.game) params.append('action', logFilters.game);
      if (logFilters.userId) params.append('userId', logFilters.userId);
      
      const { data } = await api<AuditLog[]>(`/admin/audit?${params.toString()}`);
      setAuditLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    }
  };

  const banUser = async (userId: string, ban: boolean) => {
    setLoading(true);
    setError(null);
    try {
      await api(`/admin/users/${userId}/ban`, {
        method: 'POST',
        body: JSON.stringify({ banned: ban })
      });
      setSuccess(`User ${ban ? 'banned' : 'unbanned'} successfully`);
      loadUsers();
      loadAuditLogs();
    } catch (err) {
      setError('Failed to update user status');
    } finally {
      setLoading(false);
    }
  };

  const removeFromLeaderboard = async (userId: string, game: string) => {
    setLoading(true);
    setError(null);
    try {
      await api('/admin/leaderboard/remove', {
        method: 'POST',
        body: JSON.stringify({ userId, game })
      });
      setSuccess('User removed from leaderboard');
      loadLeaderboards();
      loadAuditLogs();
    } catch (err) {
      setError('Failed to remove from leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const deleteLeaderboard = async (game: string) => {
    if (!confirm(`Are you sure you want to delete the entire ${game} leaderboard?`)) return;
    
    setLoading(true);
    setError(null);
    try {
      await api(`/admin/games/${game}/logs`, { method: 'DELETE' });
      setSuccess(`${game} leaderboard deleted`);
      loadLeaderboards();
      loadAuditLogs();
    } catch (err) {
      setError('Failed to delete leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const updatePageLock = async (pageKey: string, locked: boolean, messageEn: string, messageDe: string) => {
    setLoading(true);
    setError(null);
    try {
      await api(`/admin/settings/pages/${pageKey}`, {
        method: 'PUT',
        body: JSON.stringify({
          lockedForMembers: locked,
          lockedMessageEn: messageEn,
          lockedMessageDe: messageDe
        })
      });
      setSuccess('Page lock updated');
      loadPageLocks();
      loadAuditLogs();
    } catch (err) {
      setError('Failed to update page lock');
    } finally {
      setLoading(false);
    }
  };

  const addNewPageLock = async () => {
    if (!newPageKey.trim()) {
      setError('Page key is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await api(`/admin/settings/pages/${newPageKey}`, {
        method: 'PUT',
        body: JSON.stringify({
          lockedForMembers: false,
          lockedMessageEn: 'This page is currently under maintenance.',
          lockedMessageDe: 'Diese Seite wird derzeit gewartet.'
        })
      });
      setSuccess('New page lock added');
      setNewPageKey('');
      loadPageLocks();
      loadAuditLogs();
    } catch (err) {
      setError('Failed to add page lock');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>Access denied. Admin privileges required.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        {loading && <Loader2 className="h-6 w-6 animate-spin" />}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="games" className="flex items-center gap-2">
            <Gamepad2 className="h-4 w-4" />
            Games
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Logs
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.users}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
                  <Ban className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.bannedUsers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Leaderboard Entries</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.leaderboardEntries}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Blackjack Balances</CardTitle>
                  <Gamepad2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.blackjackBalances}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>Games Tracked</CardTitle>
                <CardDescription>Games currently in the leaderboard system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {stats.gamesTracked.map((game) => (
                    <Badge key={game} variant="secondary">{game}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts, ban/unban users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">ID</th>
                        <th className="text-left p-2">Username</th>
                        <th className="text-left p-2">Email</th>
                        <th className="text-left p-2">Role</th>
                        <th className="text-left p-2">Created</th>
                        <th className="text-left p-2">Last Login</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-mono text-xs">{user.id}</td>
                          <td className="p-2">
                            <span className={user.role === 'admin' ? 'text-red-500 font-bold' : ''}>
                              {user.username}
                            </span>
                          </td>
                          <td className="p-2">{user.email}</td>
                          <td className="p-2">
                            <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                              {user.role}
                            </Badge>
                          </td>
                          <td className="p-2">{new Date(user.created_at).toLocaleDateString()}</td>
                          <td className="p-2">
                            {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="p-2">
                            {user.banned ? (
                              <Badge variant="destructive">Banned</Badge>
                            ) : (
                              <Badge variant="default">Active</Badge>
                            )}
                          </td>
                          <td className="p-2">
                            <Button
                              size="sm"
                              variant={user.banned ? "default" : "destructive"}
                              onClick={() => banUser(user.id, !user.banned)}
                              disabled={loading || user.role === 'admin'}
                            >
                              {user.banned ? <UserCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                              {user.banned ? 'Unban' : 'Ban'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Games Tab */}
        <TabsContent value="games" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Game Management</CardTitle>
              <CardDescription>Manage leaderboards and game data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Select value={selectedGame} onValueChange={setSelectedGame}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Blackjack">Blackjack</SelectItem>
                      <SelectItem value="RiskPlay">RiskPlay</SelectItem>
                      <SelectItem value="HighRiskClicker">HighRiskClicker</SelectItem>
                      <SelectItem value="Tetris">Tetris</SelectItem>
                      <SelectItem value="Snake">Snake</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="destructive"
                    onClick={() => deleteLeaderboard(selectedGame)}
                    disabled={loading}
                  >
                    Delete {selectedGame} Leaderboard
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">User ID</th>
                        <th className="text-left p-2">Username</th>
                        <th className="text-left p-2">Score</th>
                        <th className="text-left p-2">Updated</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboards.map((entry) => (
                        <tr key={`${entry.user_id}-${entry.game}`} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-mono text-xs">{entry.user_id}</td>
                          <td className="p-2">
                            <span className={userDropdown.find(u => u.id === entry.user_id)?.username === user?.username ? 'text-red-500 font-bold' : ''}>
                              {entry.username}
                            </span>
                          </td>
                          <td className="p-2 font-bold">{entry.score.toLocaleString()}</td>
                          <td className="p-2">{new Date(entry.updated_at).toLocaleDateString()}</td>
                          <td className="p-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeFromLeaderboard(entry.user_id, entry.game)}
                              disabled={loading}
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Page Lock Management</CardTitle>
              <CardDescription>Lock pages for maintenance or other purposes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Add new page lock */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Add New Page Lock</h3>
                  <div className="flex items-center gap-4">
                    <Input
                      placeholder="Page key (e.g., tetris, contact, blackjack)"
                      value={newPageKey}
                      onChange={(e) => setNewPageKey(e.target.value)}
                    />
                    <Button onClick={addNewPageLock} disabled={loading || !newPageKey.trim()}>
                      Add Page
                    </Button>
                  </div>
                </div>

                {/* Existing page locks */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Existing Page Locks</h3>
                  {pageLocks.map((page) => (
                    <Card key={page.pageKey}>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{page.pageKey}</h4>
                              <p className="text-sm text-muted-foreground">
                                Last updated: {new Date(page.updatedAt).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`lock-${page.pageKey}`}>Locked</Label>
                              <Switch
                                id={`lock-${page.pageKey}`}
                                checked={page.lockedForMembers}
                                onCheckedChange={(checked) => 
                                  updatePageLock(page.pageKey, checked, page.lockedMessageEn, page.lockedMessageDe)
                                }
                                disabled={loading}
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>English Message</Label>
                              <Textarea
                                value={page.lockedMessageEn}
                                onChange={(e) => 
                                  updatePageLock(page.pageKey, page.lockedForMembers, e.target.value, page.lockedMessageDe)
                                }
                                placeholder="This page is currently under maintenance."
                                disabled={loading}
                              />
                            </div>
                            <div>
                              <Label>German Message</Label>
                              <Textarea
                                value={page.lockedMessageDe}
                                onChange={(e) => 
                                  updatePageLock(page.pageKey, page.lockedForMembers, page.lockedMessageEn, e.target.value)
                                }
                                placeholder="Diese Seite wird derzeit gewartet."
                                disabled={loading}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>View system activity and admin actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Date From</Label>
                    <Input
                      type="date"
                      value={logFilters.dateFrom}
                      onChange={(e) => setLogFilters({...logFilters, dateFrom: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Date To</Label>
                    <Input
                      type="date"
                      value={logFilters.dateTo}
                      onChange={(e) => setLogFilters({...logFilters, dateTo: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Game/Action</Label>
                    <Input
                      placeholder="Filter by action"
                      value={logFilters.game}
                      onChange={(e) => setLogFilters({...logFilters, game: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>User</Label>
                    <Select value={logFilters.userId} onValueChange={(value) => setLogFilters({...logFilters, userId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All users</SelectItem>
                        {userDropdown.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.id} | {u.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={loadAuditLogs} disabled={loading}>
                  Apply Filters
                </Button>

                {/* Log entries */}
                <div className="space-y-2 max-h-[600px] overflow-auto">
                  {auditLogs.map((log) => (
                    <Card key={log.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-muted-foreground">#{log.id}</span>
                              <Badge variant="outline">{log.action}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(log.created_at).toLocaleString()}
                              </span>
                            </div>
                            
                            <div className="text-sm">
                              {log.actor_username && (
                                <span className="font-semibold text-blue-600">
                                  Actor: {log.actor_username} ({log.actor_user_id})
                                </span>
                              )}
                              {log.target_username && (
                                <span className="ml-2 font-semibold text-green-600">
                                  Target: {log.target_username} ({log.target_user_id})
                                </span>
                              )}
                            </div>
                            
                            {log.details && (
                              <div className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                                {typeof log.details === 'string' ? log.details : JSON.stringify(log.details, null, 2)}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {auditLogs.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      No audit logs found
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;