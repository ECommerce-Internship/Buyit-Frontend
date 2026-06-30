import axiosInstance from './axiosInstance';
import type { UserProfile, UpdateProfileBody, ChangePasswordBody } from '../types/auth';

// GET the signed-in user's profile. Requires a logged-in token (axiosInstance attaches it).
export async function getMe(): Promise<UserProfile> {
    const res = await axiosInstance.get<UserProfile>('/api/v1/auth/me');
    return res.data;
}

// PUT first/last/phone. Returns the UPDATED profile.
export async function updateProfile(body: UpdateProfileBody): Promise<UserProfile> {
    const res = await axiosInstance.put<UserProfile>('/api/v1/auth/me', body);
    return res.data;
}

// POST a password change. 204 on success (no body). 401 = wrong current password;
// 409 = Google-only account with no password; 400 = validation error.
export async function changePassword(body: ChangePasswordBody): Promise<void> {
    await axiosInstance.post('/api/v1/auth/change-password', body);
}