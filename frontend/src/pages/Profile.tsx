import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { userService, UpdateProfileData } from '../services/user.service';
import { authService, ChangePasswordData } from '../services/auth.service';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Must contain a special character'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export const Profile = () => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: userService.getProfile,
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: profile ? { firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone || '' } : undefined,
  });

  const {
    register: regPwd,
    handleSubmit: handlePwd,
    formState: { errors: pwdErrors },
    reset: resetPwd,
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileData) => userService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success('Profile updated');
      setIsEditing(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const passwordMutation = useMutation({
    mutationFn: (data: ChangePasswordData) => authService.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed');
      setShowPasswordForm(false);
      resetPwd();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to change password'),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account information</p>
      </div>

      {/* Profile card */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="btn btn-outline text-sm">Edit</button>
          )}
        </div>

        {!isEditing ? (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="First Name" value={profile?.firstName} />
            <Field label="Last Name" value={profile?.lastName} />
            <Field label="Email" value={profile?.email} />
            <div>
              <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Role</dt>
              <RoleBadge role={profile?.role ?? ''} />
            </div>
            <Field label="Phone" value={profile?.phone || '—'} />
            <div>
              <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Email Status</dt>
              <dd>
                {profile?.isEmailVerified
                  ? <span className="text-sm font-medium text-emerald-600">● Verified</span>
                  : <span className="text-sm font-medium text-amber-500">● Unverified</span>}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Account Status</dt>
              <dd className={`text-sm font-medium ${profile?.isActive ? 'text-emerald-600' : 'text-red-500'}`}>
                {profile?.isActive ? 'Active' : 'Inactive'}
              </dd>
            </div>
            <Field
              label="Member Since"
              value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}
            />
          </dl>
        ) : (
          <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input {...register('firstName')} className="input" />
                {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input {...register('lastName')} className="input" />
                {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
                <input {...register('phone')} type="tel" className="input" placeholder="+1 (555) 000-0000" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => { reset(); setIsEditing(false); }} className="btn btn-outline">Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Change password card */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Password</h2>
          {!showPasswordForm && (
            <button onClick={() => setShowPasswordForm(true)} className="btn btn-outline text-sm">Change Password</button>
          )}
        </div>

        {!showPasswordForm ? (
          <p className="text-sm text-gray-500">Keep your account secure with a strong password.</p>
        ) : (
          <form onSubmit={handlePwd((d) => passwordMutation.mutate({ currentPassword: d.currentPassword, newPassword: d.newPassword }))} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input {...regPwd('currentPassword')} type="password" className="input" />
              {pwdErrors.currentPassword && <p className="mt-1 text-xs text-red-600">{pwdErrors.currentPassword.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input {...regPwd('newPassword')} type="password" className="input" />
              {pwdErrors.newPassword && <p className="mt-1 text-xs text-red-600">{pwdErrors.newPassword.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input {...regPwd('confirmPassword')} type="password" className="input" />
              {pwdErrors.confirmPassword && <p className="mt-1 text-xs text-red-600">{pwdErrors.confirmPassword.message}</p>}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => { setShowPasswordForm(false); resetPwd(); }} className="btn btn-outline">Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={passwordMutation.isPending}>
                {passwordMutation.isPending ? 'Changing…' : 'Change Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</dt>
      <dd className="text-sm font-medium text-gray-800">{value || '—'}</dd>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    ADMIN: 'bg-rose-50 text-rose-700 ring-rose-200',
    AGENT: 'bg-blue-50 text-blue-700 ring-blue-200',
    CUSTOMER: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ${map[role] ?? 'bg-gray-100 text-gray-700 ring-gray-200'}`}>
      {role}
    </span>
  );
}
