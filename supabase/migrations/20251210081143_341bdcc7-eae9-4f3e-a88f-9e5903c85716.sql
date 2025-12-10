-- Allow super_admin to view all user roles
CREATE POLICY "Super admins can view all roles"
ON public.user_roles
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

-- Allow super_admin to insert user roles
CREATE POLICY "Super admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Allow super_admin to update user roles
CREATE POLICY "Super admins can update roles"
ON public.user_roles
FOR UPDATE
USING (has_role(auth.uid(), 'super_admin'));

-- Allow super_admin to delete user roles
CREATE POLICY "Super admins can delete roles"
ON public.user_roles
FOR DELETE
USING (has_role(auth.uid(), 'super_admin'));

-- Allow super_admin to view all profiles for user management
CREATE POLICY "Super admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));