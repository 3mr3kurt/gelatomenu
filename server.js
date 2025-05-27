// Load environment variables from .env file in development
if (process.env.NODE_ENV !== "production") {
  try {
    require("dotenv").config();
  } catch (e) {
    console.log("dotenv module not found, skipping .env loading");
  }
}

const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 8080;

const allFlavors = require("./flavors.json");
const db = require("./database");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.get("/flavors", async (req, res) => {
  try {
    const currentFlavors = await db.getCurrentFlavors();
    res.json(currentFlavors);
  } catch (err) {
    console.error("Error fetching flavors:", err);
    res.status(500).json({ success: false, message: "Error fetching flavors" });
  }
});

app.get("/flavors/all", (req, res) => {
  res.json(Object.keys(allFlavors));
});

app.post("/flavors", async (req, res) => {
  const { flavor } = req.body;
  if (allFlavors[flavor]) {
    try {
      const exists = await db.flavorExists(flavor);
      if (!exists) {
        await db.addFlavor(flavor, allFlavors[flavor]);
        res.json({ success: true, message: "Flavor added", action: "added" });
      } else {
        await db.removeFlavor(flavor);
        res.json({
          success: true,
          message: "Flavor removed",
          action: "removed",
        });
      }
    } catch (err) {
      console.error("Error updating flavors:", err);
      res
        .status(500)
        .json({ success: false, message: "Error updating flavors" });
    }
  } else {
    res.status(400).json({ success: false, message: "Invalid flavor" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
