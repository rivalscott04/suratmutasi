import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Users as UsersIcon, 
  Loader2,
  Eye,
  EyeOff,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'operator' | 'user' | 'admin_wilayah' | 'bimas';
  office_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface UserFormData {
  email: string;
  full_name: string;
  password: string;
  role: 'admin' | 'operator' | 'user' | 'admin_wilayah' | 'bimas';
  office_id: string;
}

const Users = () => {
  const { user, token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    full_name: '',
    password: '',
    role: 'user',
    office_id: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddUserResultModal, setShowAddUserResultModal] = useState(false);
  const [addUserSuccess, setAddUserSuccess] = useState<boolean | null>(null);
  const [addUserMessage, setAddUserMessage] = useState('');
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Generate secure password
  const generateSecurePassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one character from each category
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest with random characters
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  // Copy password to clipboard
  const copyPasswordToClipboard = async (password: string) => {
    if (!password) {
      toast({
        title: "Gagal menyalin",
        description: "Password kosong",
        variant: "destructive",
      });
      return;
    }

    // Fallback method yang lebih reliable (works in all browsers)
    const fallbackCopy = (text: string): boolean => {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '0';
        textarea.style.top = '0';
        textarea.style.opacity = '0';
        textarea.style.pointerEvents = 'none';
        textarea.setAttribute('readonly', '');
        document.body.appendChild(textarea);
        
        // Select text
        if (navigator.userAgent.match(/ipad|iphone/i)) {
          // iOS
          const range = document.createRange();
          range.selectNodeContents(textarea);
          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
          }
          textarea.setSelectionRange(0, 999999);
        } else {
          textarea.select();
        }
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        return successful;
      } catch (err) {
        console.error('Fallback copy failed:', err);
        return false;
      }
    };

    try {
      // Try modern clipboard API first (requires HTTPS or localhost)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(password);
        setCopiedPassword(true);
        toast({
          title: "Password disalin",
          description: "Password telah disalin ke clipboard",
        });
        setTimeout(() => setCopiedPassword(false), 2000);
        return;
      }
    } catch (err) {
      console.warn('Clipboard API failed, trying fallback:', err);
    }

    // Fallback to legacy method
    const success = fallbackCopy(password);
    if (success) {
      setCopiedPassword(true);
      toast({
        title: "Password disalin",
        description: "Password telah disalin ke clipboard",
      });
      setTimeout(() => setCopiedPassword(false), 2000);
    } else {
      // Last resort: show password in alert so user can manually copy
      toast({
        title: "Gagal menyalin otomatis",
        description: "Silakan salin password secara manual dari field password",
        variant: "destructive",
        duration: 5000,
      });
      // Focus and select password field
      const passwordInput = document.querySelector('input[type="password"], input[type="text"][id*="password"]') as HTMLInputElement;
      if (passwordInput) {
        passwordInput.focus();
        passwordInput.select();
      }
    }
  };

  // Generate and set password
  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword();
    setFormData({ ...formData, password: newPassword });
    toast({
      title: "Password di-generate",
      description: "Password secure telah di-generate",
    });
  };

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-2">Akses Ditolak</h2>
              <p className="text-gray-600">Anda tidak memiliki akses ke halaman ini.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await apiGet('/api/users', token);
      setUsers(response.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast({
        title: "Error",
        description: "Gagal mengambil data user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setFormData({
      email: '',
      full_name: '',
      password: '',
      role: 'user',
      office_id: ''
    });
    setShowAddDialog(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      full_name: user.full_name,
      password: '', // Don't show password when editing
      role: user.role,
      office_id: user.office_id || ''
    });
    setShowEditDialog(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const handleSubmit = async (isEdit: boolean = false) => {
    if (!token) return;

    setIsSubmitting(true);
    try {
      if (isEdit && selectedUser) {
        // Update user
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password; // Don't send empty password
        }
        await apiPut(`/api/users/${selectedUser.id}`, updateData, token);
        setAddUserSuccess(true);
        setAddUserMessage('User berhasil diperbarui.');
      } else {
        // Create new user
        await apiPost('/api/users', formData, token);
        setAddUserSuccess(true);
        setAddUserMessage('User berhasil ditambahkan.');
      }
      
      fetchUsers();
      // Close form modal first, then show result modal
      setShowAddDialog(false);
      setShowEditDialog(false);
      setFormData({
        email: '',
        full_name: '',
        password: '',
        role: 'user',
        office_id: ''
      });
    } catch (error: any) {
      setAddUserSuccess(false);
      setAddUserMessage(error?.message || 'Gagal menyimpan user.');
    } finally {
      setIsSubmitting(false);
      // Close form modal first, then show result modal
      setShowAddDialog(false);
      setShowEditDialog(false);
      setShowAddUserResultModal(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!token || !selectedUser) return;

    setIsSubmitting(true);
    try {
      await apiDelete(`/api/users/${selectedUser.id}`, token);
      toast({
        title: "Sukses",
        description: "User berhasil dihapus",
      });
      fetchUsers();
      setShowDeleteDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus user",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'operator':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      case 'admin_wilayah':
        return 'bg-purple-100 text-purple-800';
      case 'bimas':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Modal Hasil Tambah User */}
      {showAddUserResultModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center animate-in zoom-in-95 duration-200">
            {addUserSuccess ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900">Berhasil</h2>
                <p className="text-gray-600 mb-6 text-center">{addUserMessage}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900">Gagal</h2>
                <p className="text-gray-600 mb-6 text-center">{addUserMessage}</p>
              </div>
            )}
            <button
              className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white text-lg font-semibold shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400"
              onClick={() => setShowAddUserResultModal(false)}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="w-5 h-5" />
                Management User
              </CardTitle>
              <CardDescription>
                Kelola user dan akses sistem
              </CardDescription>
            </div>
            <Button onClick={handleAddUser} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Tambah User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2 text-green-600" />
              <span>Loading users...</span>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Office ID</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        {searchTerm ? 'Tidak ada user yang ditemukan' : 'Belum ada user'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.office_id || '-'}</TableCell>
                        <TableCell>
                          {user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID') : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
         <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah User Baru</DialogTitle>
            <DialogDescription>
              Masukkan informasi user yang akan ditambahkan ke sistem.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>
            <div>
              <Label htmlFor="full_name">Nama Lengkap</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Nama lengkap user"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Password"
                  />
                  <div className="absolute right-0 top-0 h-full flex items-center gap-1 pr-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-full px-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    {formData.password && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-full px-2 hover:bg-transparent"
                        onClick={() => copyPasswordToClipboard(formData.password)}
                      >
                        {copiedPassword ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGeneratePassword}
                    className="flex items-center gap-2 border-green-600 text-green-600 hover:bg-green-50"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Generate Password
                  </Button>
                  {formData.password && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyPasswordToClipboard(formData.password)}
                      className="flex items-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      {copiedPassword ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copiedPassword ? 'Disalin!' : 'Copy Password'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value: 'admin' | 'operator' | 'user' | 'admin_wilayah' | 'bimas') => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="operator">Operator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="admin_wilayah">Admin Wilayah</SelectItem>
                  <SelectItem value="bimas">Bimas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="office_id">Office ID</Label>
              <Input
                id="office_id"
                value={formData.office_id}
                onChange={(e) => setFormData({ ...formData, office_id: e.target.value })}
                placeholder="ID kantor (opsional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Batal
            </Button>
            <Button 
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting || !formData.email || !formData.full_name || !formData.password}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2 text-white" /> : null}
              Tambah User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Perbarui informasi user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>
            <div>
              <Label htmlFor="edit-full_name">Nama Lengkap</Label>
              <Input
                id="edit-full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Nama lengkap user"
              />
            </div>
            <div>
              <Label htmlFor="edit-password">Password Baru (opsional)</Label>
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="edit-password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Kosongkan jika tidak ingin mengubah password"
                  />
                  <div className="absolute right-0 top-0 h-full flex items-center gap-1 pr-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-full px-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    {formData.password && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-full px-2 hover:bg-transparent"
                        onClick={() => copyPasswordToClipboard(formData.password)}
                      >
                        {copiedPassword ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGeneratePassword}
                    className="flex items-center gap-2 border-green-600 text-green-600 hover:bg-green-50"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Generate Password
                  </Button>
                  {formData.password && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyPasswordToClipboard(formData.password)}
                      className="flex items-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      {copiedPassword ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copiedPassword ? 'Disalin!' : 'Copy Password'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-role">Role</Label>
              <Select value={formData.role} onValueChange={(value: 'admin' | 'operator' | 'user' | 'admin_wilayah' | 'bimas') => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="operator">Operator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="admin_wilayah">Admin Wilayah</SelectItem>
                  <SelectItem value="bimas">Bimas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-office_id">Office ID</Label>
              <Input
                id="edit-office_id"
                value={formData.office_id}
                onChange={(e) => setFormData({ ...formData, office_id: e.target.value })}
                placeholder="ID kantor (opsional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Batal
            </Button>
            <Button 
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting || !formData.email || !formData.full_name}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2 text-white" /> : null}
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus User</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus user "{selectedUser?.full_name}"? 
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2 text-white" /> : null}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Users; 