import dns from 'node:dns';
import mongoose from 'mongoose';

// Some networks/ISPs refuse the SRV lookup that mongodb+srv:// needs.
// Use public DNS in development only.
if (process.env.NODE_ENV !== 'production') {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}

export async function connectDatabase(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not configured');
  }

  await mongoose.connect(mongoUri);

  console.log('MongoDB connected successfully');
}
