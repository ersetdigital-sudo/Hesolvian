import { NextResponse } from 'next/server';
import { endAdminSession } from '@/lib/adminAuth';

export async function POST(request: Request) {
  await endAdminSession();
  // 303 supaya browser mengubah method jadi GET setelah redirect.
  return NextResponse.redirect(new URL('/admin/login', request.url), { status: 303 });
}
