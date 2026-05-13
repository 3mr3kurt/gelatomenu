const { Pool } = require("pg");

// Create a connection pool using the Neon connection string
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://user:password@localhost:5432/gelato_db",
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// Log connection status
pool.on("connect", () => {
  console.log("Connected to Neon PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("Unexpected error on PostgreSQL client", err);
  process.exit(-1);
});

// Initialize the database
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // First try to create a custom schema that we own
    try {
      await client.query(`CREATE SCHEMA IF NOT EXISTS gelato_schema`);
      console.log("Created custom schema (if it didn't exist)");
    } catch (schemaError) {
      console.warn(
        "Note: Unable to create custom schema:",
        schemaError.message,
      );
      // Continue anyway, as we'll try using public schema
    }

    // Now try to create tables in our custom schema
    await client.query(`
      CREATE TABLE IF NOT EXISTS gelato_schema.current_flavors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE,
        image VARCHAR(255)
      )
    `);
    
    // Create title table
    await client.query(`
      CREATE TABLE IF NOT EXISTS gelato_schema.page_title (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL DEFAULT 'Current Flavors'
      )
    `);
    
    // Insert default title if table is empty
    await client.query(`
      INSERT INTO gelato_schema.page_title (title) 
      SELECT 'Current Flavors' 
      WHERE NOT EXISTS (SELECT 1 FROM gelato_schema.page_title)
    `);
    
    console.log("Database tables initialized in custom schema");
  } catch (error) {
    console.error("Error creating database tables:", error);

    // If the above failed, fall back to trying with the public schema
    try {
      console.log(
        "Attempting to create tables in public schema as fallback...",
      );
      await client.query(`
        CREATE TABLE IF NOT EXISTS current_flavors (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) UNIQUE,
          image VARCHAR(255)
        )
      `);
      
      // Create title table in public schema
      await client.query(`
        CREATE TABLE IF NOT EXISTS page_title (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL DEFAULT 'Current Flavors'
        )
      `);
      
      // Insert default title if table is empty
      await client.query(`
        INSERT INTO page_title (title) 
        SELECT 'Current Flavors' 
        WHERE NOT EXISTS (SELECT 1 FROM page_title)
      `);
      
      console.log("Database tables initialized in public schema");
    } catch (fallbackError) {
      console.error("Error in fallback attempt:", fallbackError);
      throw fallbackError;
    }
  } finally {
    client.release();
  }
}

// Get all current flavors from the database
async function getCurrentFlavors() {
  const client = await pool.connect();
  try {
    // Try the custom schema first
    try {
      const result = await client.query(
        "SELECT name, image FROM gelato_schema.current_flavors",
      );
      return result.rows;
    } catch (error) {
      console.log("Falling back to public schema for queries");
      const result = await client.query(
        "SELECT name, image FROM current_flavors",
      );
      return result.rows;
    }
  } catch (error) {
    console.error("Error getting current flavors:", error);
    throw error;
  } finally {
    client.release();
  }
}

// Add a flavor to the database
async function addFlavor(flavor, imagePath) {
  const client = await pool.connect();
  try {
    // Try the custom schema first
    try {
      const result = await client.query(
        "INSERT INTO gelato_schema.current_flavors (name, image) VALUES ($1, $2) RETURNING id",
        [flavor, imagePath],
      );
      return { id: result.rows[0].id, name: flavor, image: imagePath };
    } catch (error) {
      console.log("Falling back to public schema for insert");
      const result = await client.query(
        "INSERT INTO current_flavors (name, image) VALUES ($1, $2) RETURNING id",
        [flavor, imagePath],
      );
      return { id: result.rows[0].id, name: flavor, image: imagePath };
    }
  } catch (error) {
    console.error("Error adding flavor:", error);
    throw error;
  } finally {
    client.release();
  }
}

// Remove a flavor from the database
async function removeFlavor(flavor) {
  const client = await pool.connect();
  try {
    // Try the custom schema first
    try {
      const result = await client.query(
        "DELETE FROM gelato_schema.current_flavors WHERE name = $1",
        [flavor],
      );
      return { changes: result.rowCount };
    } catch (error) {
      console.log("Falling back to public schema for delete");
      const result = await client.query(
        "DELETE FROM current_flavors WHERE name = $1",
        [flavor],
      );
      return { changes: result.rowCount };
    }
  } catch (error) {
    console.error("Error removing flavor:", error);
    throw error;
  } finally {
    client.release();
  }
}

// Check if a flavor exists in the database
async function flavorExists(flavor) {
  const client = await pool.connect();
  try {
    // Try the custom schema first
    try {
      const result = await client.query(
        "SELECT 1 FROM gelato_schema.current_flavors WHERE name = $1",
        [flavor],
      );
      return result.rows.length > 0;
    } catch (error) {
      console.log("Falling back to public schema for exists check");
      const result = await client.query(
        "SELECT 1 FROM current_flavors WHERE name = $1",
        [flavor],
      );
      return result.rows.length > 0;
    }
  } catch (error) {
    console.error("Error checking if flavor exists:", error);
    throw error;
  } finally {
    client.release();
  }
}

// Get the current page title
async function getPageTitle() {
  const client = await pool.connect();
  try {
    // Try the custom schema first
    try {
      const result = await client.query(
        "SELECT title FROM gelato_schema.page_title ORDER BY id LIMIT 1"
      );
      return result.rows[0]?.title || "Current Flavors";
    } catch (error) {
      console.log("Falling back to public schema for title query");
      const result = await client.query(
        "SELECT title FROM page_title ORDER BY id LIMIT 1"
      );
      return result.rows[0]?.title || "Current Flavors";
    }
  } catch (error) {
    console.error("Error getting page title:", error);
    return "Current Flavors";
  } finally {
    client.release();
  }
}

// Update the page title
async function updatePageTitle(newTitle) {
  const client = await pool.connect();
  try {
    // Try the custom schema first
    try {
      const result = await client.query(
        "UPDATE gelato_schema.page_title SET title = $1 WHERE id = (SELECT id FROM gelato_schema.page_title ORDER BY id LIMIT 1)",
        [newTitle]
      );
      return { success: true, title: newTitle };
    } catch (error) {
      console.log("Falling back to public schema for title update");
      const result = await client.query(
        "UPDATE page_title SET title = $1 WHERE id = (SELECT id FROM page_title ORDER BY id LIMIT 1)",
        [newTitle]
      );
      return { success: true, title: newTitle };
    }
  } catch (error) {
    console.error("Error updating page title:", error);
    throw error;
  } finally {
    client.release();
  }
}

// Initialize the database on startup
initializeDatabase().catch(console.error);

module.exports = {
  getCurrentFlavors,
  addFlavor,
  removeFlavor,
  flavorExists,
  getPageTitle,
  updatePageTitle,
};
