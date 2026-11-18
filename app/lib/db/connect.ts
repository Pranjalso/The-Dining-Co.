import mongoose from 'mongoose';

const DEFAULT_MONGODB_URI = 'mongodb+srv://pranjalsoni484_db_user:VEdZAn9RiV4sAT1O@cluster0.qwmuqhs.mongodb.net/test?retryWrites=true&w=majority';
const MONGODB_URI = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: Cached;
}

if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

const cached: Cached = global.mongoose;

async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise || mongoose.connection.readyState === 0) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      autoIndex: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
    };

    console.log('Connecting to MongoDB...', {
      uriPreview: MONGODB_URI.slice(0, 30).replace(/:[^@]+@/, ':*****@'),
      options: opts,
    });
    
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((m) => {
        console.log('MongoDB connected successfully');
        return m;
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error);
        cached.promise = null;
        cached.conn = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null;
    cached.conn = null;
    console.error('MongoDB connection error:', e);
    throw new Error(`Failed to connect to database: ${e?.message || 'Check connection settings'}`);
  }

  return cached.conn;
}

// Add connection event listeners
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  cached.conn = null;
  cached.promise = null;
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  cached.conn = null;
  cached.promise = null;
});

export default connectDB;