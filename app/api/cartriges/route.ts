import { prisma } from '@/shared/utils';
import { NextResponse } from 'next/server';

export async function GET() {
  const cartriges = await prisma.cartridge.findMany();

  return NextResponse.json(cartriges);
}
