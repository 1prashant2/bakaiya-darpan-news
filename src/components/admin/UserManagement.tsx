import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, UserCog, Users } from 'lucide-react';
import { AppRole, Profile, UserRole } from '@/lib/types';

interface UserWithRole extends Profile {
  user_roles?: { role: AppRole }[];
}

const roleLabels: Record<AppRole, string> = {
  super_admin: 'सुपर एडमिन',
  admin: 'एडमिन',
  editor: 'सम्पादक',
  author: 'लेखक',
  reader: 'पाठक',
};

const roleBadgeColors: Record<AppRole, string> = {
  super_admin: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  admin: 'bg-red-500/10 text-red-500 border-red-500/20',
  editor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  author: 'bg-green-500/10 text-green-500 border-green-500/20',
  reader: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export function UserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Fetch profiles with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Map roles to profiles
      const usersWithRoles = profiles.map(profile => ({
        ...profile,
        user_roles: roles.filter(role => role.user_id === profile.id),
      }));

      return usersWithRoles as UserWithRole[];
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppRole }) => {
      // First, check if user already has a role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role: newRole })
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'भूमिका अपडेट भयो',
        description: 'प्रयोगकर्ताको भूमिका सफलतापूर्वक अपडेट गरियो।',
      });
      setEditingUserId(null);
    },
    onError: (error) => {
      toast({
        title: 'त्रुटि',
        description: 'भूमिका अपडेट गर्न सकिएन।',
        variant: 'destructive',
      });
      console.error('Error updating role:', error);
    },
  });

  const getUserRole = (user: UserWithRole): AppRole => {
    return user.user_roles?.[0]?.role || 'reader';
  };

  const handleRoleChange = (userId: string, newRole: AppRole) => {
    updateRoleMutation.mutate({ userId, newRole });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">प्रयोगकर्ता व्यवस्थापन</h2>
        </div>
        <Badge variant="outline" className="bg-muted">
          {users.length} प्रयोगकर्ताहरू
        </Badge>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>नाम</TableHead>
              <TableHead>इमेल</TableHead>
              <TableHead>भूमिका</TableHead>
              <TableHead>दर्ता मिति</TableHead>
              <TableHead className="text-right">कार्य</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const currentRole = getUserRole(user);
              const isEditing = editingUserId === user.id;

              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {currentRole === 'super_admin' && (
                        <Shield className="h-4 w-4 text-purple-500" />
                      )}
                      {user.name || 'नाम उपलब्ध छैन'}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email || '-'}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Select
                        defaultValue={currentRole}
                        onValueChange={(value) => handleRoleChange(user.id, value as AppRole)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="super_admin">सुपर एडमिन</SelectItem>
                          <SelectItem value="admin">एडमिन</SelectItem>
                          <SelectItem value="editor">सम्पादक</SelectItem>
                          <SelectItem value="author">लेखक</SelectItem>
                          <SelectItem value="reader">पाठक</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge 
                        variant="outline" 
                        className={roleBadgeColors[currentRole]}
                      >
                        {roleLabels[currentRole]}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString('ne-NP')}
                  </TableCell>
                  <TableCell className="text-right">
                    {isEditing ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingUserId(null)}
                        disabled={updateRoleMutation.isPending}
                      >
                        {updateRoleMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'रद्द गर्नुहोस्'
                        )}
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingUserId(user.id)}
                        className="gap-2"
                      >
                        <UserCog className="h-4 w-4" />
                        भूमिका बदल्नुहोस्
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {users.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            कुनै प्रयोगकर्ता फेला परेन।
          </div>
        )}
      </div>

      {/* Role Legend */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h3 className="font-medium mb-3">भूमिका विवरण:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={roleBadgeColors.super_admin}>
              सुपर एडमिन
            </Badge>
            <span className="text-muted-foreground">- सबै अधिकार</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={roleBadgeColors.admin}>
              एडमिन
            </Badge>
            <span className="text-muted-foreground">- श्रेणी र समाचार व्यवस्थापन</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={roleBadgeColors.editor}>
              सम्पादक
            </Badge>
            <span className="text-muted-foreground">- समाचार प्रकाशन</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={roleBadgeColors.author}>
              लेखक
            </Badge>
            <span className="text-muted-foreground">- आफ्नो ड्राफ्ट मात्र</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={roleBadgeColors.reader}>
              पाठक
            </Badge>
            <span className="text-muted-foreground">- पढ्ने मात्र</span>
          </div>
        </div>
      </div>
    </div>
  );
}
