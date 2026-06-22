import mongoose from "mongoose";

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is required. Copy server/.env.example to server/.env.");
  }

  mongoose.set("strictQuery", true);
  const connection = await mongoose.connect(mongoUri);
  // Log the database NAME (not just host) so each deployment's data scope is
  // visible. If TFC and NextMind print the same name, they share data.
  console.log(
    `MongoDB connected: host=${connection.connection.host} db=${connection.connection.name} school=${process.env.SCHOOL_SHORT || "TFC"}`
  );
};
