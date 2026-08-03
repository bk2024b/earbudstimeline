'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(formData) {
  const password = formData.get('password');

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    redirect('/admin/login?error=1');
  }

  cookies().set('admin_session', process.env.ADMIN_SESSION_SECRET, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 jours
  });

  redirect('/admin');
}

export async function logout() {
  cookies().delete('admin_session');
  redirect('/admin/login');
}
