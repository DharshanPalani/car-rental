// src/lib/database.ts
// Simple in-memory SQL-like database for frontend use

interface TableData {
  [key: string]: any[];
}

class SimpleSQL {
  private tables: TableData = {};

  constructor() {
    this.loadFromStorage();
  }

  // Execute SQL-like commands
  execute(sql: string, params: any[] = []): any {
    const command = sql.trim().toUpperCase();
    if (command.startsWith("CREATE TABLE")) {
      return this.createTable(sql);
    } else if (command.startsWith("INSERT INTO")) {
      return this.insert(sql, params);
    } else if (command.startsWith("SELECT")) {
      return this.select(sql, params);
    } else if (command.startsWith("UPDATE")) {
      return this.update(sql, params);
    } else if (command.startsWith("DELETE FROM")) {
      return this.delete(sql, params);
    }
    return null;
  }

  private createTable(sql: string) {
    // Simple table creation - just initialize empty array
    const tableName = sql.match(/CREATE TABLE (\w+)/)?.[1];
    if (tableName) {
      this.tables[tableName] = [];
    }
  }

  private insert(sql: string, params: any[]) {
    const tableName = sql.match(/INSERT INTO (\w+)/)?.[1];
    if (tableName && this.tables[tableName]) {
      // params[0] should be the object to insert
      this.tables[tableName].push(params[0]);
      this.saveToStorage();
      return { insertId: this.tables[tableName].length };
    }
    return null;
  }

  private select(sql: string, params: any[]) {
    const tableName = sql.match(/SELECT \* FROM (\w+)/)?.[1];
    if (tableName && this.tables[tableName]) {
      let results = [...this.tables[tableName]];

      // Simple WHERE clause handling
      const whereMatch = sql.match(/WHERE (.+)/);
      if (whereMatch) {
        const whereClause = whereMatch[1];
        if (whereClause.includes("= ?")) {
          const column = whereClause.split(" = ")[0];
          const value = params[0];
          results = results.filter((row) => row[column] === value);
        }
      }

      return results;
    }
    return [];
  }

  private update(sql: string, params: any[]) {
    const tableName = sql.match(/UPDATE (\w+) SET/)?.[1];
    if (tableName && this.tables[tableName]) {
      const setClause = sql.match(/SET (.+) WHERE/)?.[1];
      const whereClause = sql.match(/WHERE (.+)/)?.[1];

      if (setClause && whereClause) {
        const updates: any = {};
        setClause.split(", ").forEach((set) => {
          const [col, val] = set.split(" = ");
          updates[col] = val === "?" ? params.shift() : val;
        });

        const whereCol = whereClause.split(" = ")[0];
        const whereVal = params[0];

        const index = this.tables[tableName].findIndex(
          (row) => row[whereCol] === whereVal,
        );
        if (index !== -1) {
          this.tables[tableName][index] = {
            ...this.tables[tableName][index],
            ...updates,
          };
          this.saveToStorage();
        }
      }
    }
  }

  private delete(sql: string, params: any[]) {
    const tableName = sql.match(/DELETE FROM (\w+)/)?.[1];
    if (tableName && this.tables[tableName]) {
      const whereClause = sql.match(/WHERE (.+)/)?.[1];
      if (whereClause) {
        const whereCol = whereClause.split(" = ")[0];
        const whereVal = params[0];
        this.tables[tableName] = this.tables[tableName].filter(
          (row) => row[whereCol] !== whereVal,
        );
        this.saveToStorage();
      }
    }
  }

  private saveToStorage() {
    localStorage.setItem("carRentalDb", JSON.stringify(this.tables));
  }

  private loadFromStorage() {
    const saved = localStorage.getItem("carRentalDb");
    if (saved) {
      this.tables = JSON.parse(saved);
      // Migrate old user data to new format
      this.migrateUserData();
    } else {
      // Initialize tables
      this.tables = {
        users: [],
        vehicles: [],
        bookings: [],
        payments: [],
        kyc_documents: [],
      };
    }
  }

  private migrateUserData() {
    // Migrate old user data to new format
    if (this.tables.users && this.tables.users.length > 0) {
      this.tables.users = this.tables.users
        .filter((user: any) => user && typeof user === "object") // Filter out invalid entries
        .map((user: any) => {
          // If user doesn't have required fields, add them
          if (!user.name) {
            user.name =
              user.email &&
              typeof user.email === "string" &&
              user.email.includes("@")
                ? user.email.split("@")[0]
                : `user_${user.id || Math.random().toString(36).substr(2, 9)}`;
          }
          if (!user.role) {
            user.role = "customer";
          }
          if (!user.password) {
            // For existing users without passwords, set a default password
            // In production, you'd want to force password reset
            user.password = btoa("password123"); // Default password for migrated users
          }
          if (!user.created_at) {
            user.created_at = new Date().toISOString();
          }
          return user;
        });
      this.saveToStorage();
    }
  }

  exportSQL(): string {
    const sqlCommands: string[] = [];

    // Generate CREATE TABLE commands
    Object.keys(this.tables).forEach((tableName) => {
      sqlCommands.push(`CREATE TABLE ${tableName} (id TEXT PRIMARY KEY);`);
    });

    // Generate INSERT commands
    Object.entries(this.tables).forEach(([tableName, rows]) => {
      rows.forEach((row: any) => {
        const columns = Object.keys(row);
        const values = columns
          .map((col) => {
            const val = row[col];
            if (typeof val === "string") return `'${val.replace(/'/g, "''")}'`;
            if (val === null || val === undefined) return "NULL";
            return val;
          })
          .join(", ");
        sqlCommands.push(
          `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${values});`,
        );
      });
    });

    return sqlCommands.join("\n");
  }

  importSQL(sql: string) {
    // Simple SQL import - parse and execute commands
    const commands = sql
      .split(";")
      .map((cmd) => cmd.trim())
      .filter((cmd) => cmd);
    commands.forEach((command) => {
      if (command.toUpperCase().startsWith("CREATE TABLE")) {
        this.createTable(command);
      } else if (command.toUpperCase().startsWith("INSERT INTO")) {
        // Simple parsing - would need better implementation for production
        const match = command.match(
          /INSERT INTO (\w+) \(([^)]+)\) VALUES \(([^)]+)\)/,
        );
        if (match) {
          const [, tableName, columnsStr, valuesStr] = match;
          const columns = columnsStr.split(",").map((col) => col.trim());
          const values = valuesStr.split(",").map((val) => {
            val = val.trim();
            if (val.startsWith("'") && val.endsWith("'")) {
              return val.slice(1, -1).replace(/''/g, "'");
            }
            if (val === "NULL") return null;
            if (!isNaN(Number(val))) return Number(val);
            return val;
          });

          const row: any = {};
          columns.forEach((col, i) => {
            row[col] = values[i];
          });

          if (this.tables[tableName]) {
            this.tables[tableName].push(row);
          }
        }
      }
    });
    this.saveToStorage();
  }
}

const db = new SimpleSQL();

// Helper functions for our API
const generateId = () => crypto.randomUUID();

const currentTimestamp = () => new Date().toISOString();

// Auth functions (simplified, using database)
export const authApi = {
  signUp: async (email: string, password: string) => {
    // Check if user already exists
    const existingUsers = db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (existingUsers.length > 0) {
      throw new Error("User already exists");
    }

    const id = generateId();
    const created_at = currentTimestamp();
    // Simple password hashing (in production, use proper hashing)
    const hashedPassword = btoa(password); // Base64 encoding for demo purposes

    const user = {
      id,
      email,
      name: email.split("@")[0], // Use email prefix as name
      role: "customer" as const, // Default role
      password: hashedPassword,
      created_at,
    };

    db.execute("INSERT INTO users VALUES (?)", [user]);
    localStorage.setItem(
      "currentUser",
      JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at,
      }),
    );
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at,
      },
    };
  },

  signIn: async (email: string, password: string) => {
    const users = db.execute("SELECT * FROM users WHERE email = ?", [email]);
    const user = users[0];

    if (!user) {
      throw new Error("User not found");
    }

    // Verify password
    const hashedPassword = btoa(password);
    if (user.password !== hashedPassword) {
      throw new Error("Invalid password");
    }

    const userSession = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      created_at: user.created_at,
    };

    localStorage.setItem("currentUser", JSON.stringify(userSession));
    return { user: userSession };
  },

  signOut: async () => {
    localStorage.removeItem("currentUser");
  },

  getCurrentUser: async () => {
    const userStr = localStorage.getItem("currentUser");
    return userStr ? JSON.parse(userStr) : null;
  },
};

// Vehicle functions
export const vehicleApi = {
  getAll: async (filters?: any) => {
    console.log("vehicleApi.getAll called with filters:", filters);
    let vehicles = db.execute("SELECT * FROM vehicles");
    console.log("Raw vehicles from database:", vehicles);

    if (filters?.location) {
      vehicles = vehicles.filter((v: any) =>
        v.location?.toLowerCase().includes(filters.location.toLowerCase()),
      );
    }
    if (filters?.minPrice) {
      vehicles = vehicles.filter((v: any) => v.daily_rate >= filters.minPrice);
    }
    if (filters?.maxPrice) {
      vehicles = vehicles.filter((v: any) => v.daily_rate <= filters.maxPrice);
    }
    if (filters?.make) {
      vehicles = vehicles.filter((v: any) =>
        v.make?.toLowerCase().includes(filters.make.toLowerCase()),
      );
    }
    if (filters?.seats) {
      vehicles = vehicles.filter((v: any) => v.seats === filters.seats);
    }
    if (filters?.transmission) {
      vehicles = vehicles.filter(
        (v: any) => v.transmission === filters.transmission,
      );
    }
    if (filters?.excludeOwnerId) {
      vehicles = vehicles.filter(
        (v: any) => v.owner_id !== filters.excludeOwnerId,
      );
    }

    return vehicles.filter((v: any) => v.is_available !== false);
  },

  getById: async (id: string) => {
    const vehicles = db.execute("SELECT * FROM vehicles WHERE id = ?", [id]);
    return vehicles[0] || null;
  },

  create: async (vehicle: any) => {
    const id = generateId();
    const created_at = currentTimestamp();
    const updated_at = created_at;
    const newVehicle = { ...vehicle, id, created_at, updated_at };
    db.execute("INSERT INTO vehicles VALUES (?)", [newVehicle]);
    return newVehicle;
  },

  update: async (id: string, updates: any) => {
    console.log("Updating vehicle:", id, "with:", updates);
    // Find the vehicle
    const vehicles = db.execute("SELECT * FROM vehicles WHERE id = ?", [id]);
    console.log("Found vehicles for update:", vehicles);
    if (vehicles[0]) {
      const existing = vehicles[0];
      console.log("Existing vehicle:", existing);
      const updated = {
        ...existing,
        ...updates,
        updated_at: currentTimestamp(),
      };
      console.log("Updated vehicle object:", updated);

      // For now, we'll delete and re-insert (simple approach)
      db.execute("DELETE FROM vehicles WHERE id = ?", [id]);
      console.log("Deleted old vehicle");
      db.execute("INSERT INTO vehicles VALUES (?)", [updated]);
      console.log("Inserted updated vehicle");

      // Verify
      const verify = db.execute("SELECT * FROM vehicles WHERE id = ?", [id]);
      console.log("Verification - updated vehicle:", verify[0]);

      return updated;
    }
    throw new Error("Vehicle not found");
  },

  delete: async (id: string) => {
    db.execute("DELETE FROM vehicles WHERE id = ?", [id]);
  },

  getOwnerVehicles: async (ownerId: string) => {
    console.log("getOwnerVehicles called for ownerId:", ownerId);
    const vehicles = db.execute("SELECT * FROM vehicles WHERE owner_id = ?", [
      ownerId,
    ]);
    console.log("Owner vehicles:", vehicles);
    console.log("First vehicle full details:", vehicles[0]);
    if (vehicles[0]) {
      console.log("Vehicle images property:", vehicles[0].images);
      console.log("Vehicle images type:", typeof vehicles[0].images);
    }
    return vehicles;
  },
};

// Booking functions
// Booking functions
export const bookingApi = {
  create: async (booking: any) => {
    const id = generateId();
    const created_at = currentTimestamp();
    const updated_at = created_at;

    const newBooking = {
      ...booking,
      id,
      created_at,
      updated_at,
    };

    db.execute("INSERT INTO bookings VALUES (?)", [newBooking]);

    return newBooking;
  },

  getById: async (id: string) => {
    const bookings = db.execute("SELECT * FROM bookings WHERE id = ?", [id]);
    const booking = bookings[0];

    if (!booking) return null;

    const vehicles = db.execute("SELECT * FROM vehicles");
    const vehicle = vehicles.find((v: any) => v.id === booking.vehicle_id);

    return {
      ...booking,
      vehicle,
    };
  },

  getUserBookings: async (userId: string, role: "customer" | "owner") => {
    const field = role === "customer" ? "customer_id" : "owner_id";

    // get bookings
    const bookings = db.execute(`SELECT * FROM bookings WHERE ${field} = ?`, [
      userId,
    ]);

    // get all vehicles
    const vehicles = db.execute("SELECT * FROM vehicles");

    // create quick lookup map (faster than find loop)
    const vehicleMap: Record<string, any> = {};
    vehicles.forEach((v: any) => {
      vehicleMap[v.id] = v;
    });

    // attach vehicle to booking
    const bookingsWithVehicles = bookings.map((booking: any) => {
      return {
        ...booking,
        vehicle: vehicleMap[booking.vehicle_id] || null,
      };
    });

    return bookingsWithVehicles;
  },

  updateStatus: async (id: string, status: string) => {
    const bookings = db.execute("SELECT * FROM bookings WHERE id = ?", [id]);

    if (bookings[0]) {
      const updated = {
        ...bookings[0],
        status,
        updated_at: currentTimestamp(),
      };

      // simple replace approach
      db.execute("DELETE FROM bookings WHERE id = ?", [id]);
      db.execute("INSERT INTO bookings VALUES (?)", [updated]);

      return updated;
    }

    throw new Error("Booking not found");
  },

  checkAvailability: async (
    _vehicleId: string,
    _startDate: string,
    _endDate: string,
  ) => {
    // simplified logic
    return true;
  },
};

// KYC functions
export const kycApi = {
  uploadDocument: async (userId: string, documentType: string, file: File) => {
    const id = generateId();
    const uploaded_at = currentTimestamp();
    const document_url = `/uploads/${userId}/${documentType}_${Date.now()}.${file.name.split(".").pop()}`;
    const document = {
      id,
      user_id: userId,
      document_type: documentType,
      document_url,
      status: "pending",
      uploaded_at,
    };
    db.execute("INSERT INTO kyc_documents VALUES (?)", [document]);
    return document;
  },

  getUserDocuments: async (userId: string) => {
    return db.execute("SELECT * FROM kyc_documents WHERE user_id = ?", [
      userId,
    ]);
  },
};

export const databaseApi = {
  exportSQL: () => db.exportSQL(),
  importSQL: (sql: string) => db.importSQL(sql),
};

// Debug functions
export const debugDatabase = () => {
  const saved = localStorage.getItem("carRentalDb");
  if (saved) {
    const data = JSON.parse(saved);
    console.log("Database contents:", data);
    console.log("Vehicles:", data.vehicles);
    return data;
  } else {
    console.log("No database found in localStorage");
    return null;
  }
};

export const clearDatabase = () => {
  localStorage.removeItem("carRentalDb");
  localStorage.removeItem("currentUser");
  console.log("Database cleared");
};
