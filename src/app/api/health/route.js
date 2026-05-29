import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const conn = await connectToDatabase();
    return Response.json({
      status: 'ok',
      db: conn.connection.name,
      readyState: conn.connection.readyState,
    });
  } catch (err) {
    return Response.json({ status: 'error', message: err.message }, { status: 500 });
  }
}
