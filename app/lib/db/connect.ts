import mongoose from 'mongoose';

const VERIFIED_MONGODB_URI = 'mongodb+srv://pranjalsoni484_db_user:VEdZAn9RiV4sAT1O@cluster0.qwmuqhs.mongodb.net/test?retryWrites=true&w=majority';

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

async function tryConnect(uri: string) {
  const opts: mongoose.ConnectOptions = {
    bufferCommands: false,
    autoIndex: false,
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 8000,
    maxPoolSize: 10,
  };
  return mongoose.connect(uri, opts);
}

async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If already connecting, await that promise
  if (cached.promise && mongoose.connection.readyState !== 0) {
    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch {
      cached.promise = null;
      cached.conn = null;
    }
  }

  const primaryUri = process.env.MONGODB_URI || VERIFIED_MONGODB_URI;

  try {
    cached.promise = tryConnect(primaryUri);
    cached.conn = await cached.promise;
    console.log('MongoDB connected successfully');
    return cached.conn;
  } catch (error: any) {
    console.warn(`Primary MongoDB URI connection failed (${error?.message}). Attempting verified URI fallback...`);
    cached.promise = null;
    cached.conn = null;

    if (primaryUri !== VERIFIED_MONGODB_URI) {
      try {
        cached.promise = tryConnect(VERIFIED_MONGODB_URI);
        cached.conn = await cached.promise;
        console.log('MongoDB connected successfully using verified URI fallback');
        return cached.conn;
      } catch (fallbackError: any) {
        cached.promise = null;
        cached.conn = null;
        console.error('Verified URI fallback also failed:', fallbackError);
        throw new Error(`Failed to connect to database: ${fallbackError?.message || 'Check connection settings'}`);
      }
    }

    throw new Error(`Failed to connect to database: ${error?.message || 'Check connection settings'}`);
  }
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