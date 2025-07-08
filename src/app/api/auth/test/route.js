import { NextResponse } from 'next/server';

export async function GET() {
  const config = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GOOGLE_ID: process.env.GOOGLE_ID ? 'SET' : 'NOT SET',
    GOOGLE_SECRET: process.env.GOOGLE_SECRET ? 'SET' : 'NOT SET',
    GITHUB_ID: process.env.GITHUB_ID ? 'SET' : 'NOT SET',
    GITHUB_SECRET: process.env.GITHUB_SECRET ? 'SET' : 'NOT SET',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
  };

  return NextResponse.json({
    message: 'Auth configuration test',
    config,
    timestamp: new Date().toISOString(),
  });
}
