const express = require("express");
const router = express.Router();  // create a new router object
// Simulated restroom and printer facility data for UCLA campus buildings.
// This fake data will later be replaced by real database entries from Najm.
// Each object represents one indoor facility with precise building, floor, and metadata.
const fakeLocations = [
    {
      id: 1,
      type: "restroom",
      name: "Boelter Hall - Men's Restroom (floor 1)",
      lat: 34.0689,
      lng: -118.4433,
      building: "Boelter Hall",
      floor: "floor 1",
      gender: "male",
      accessible: true,
      openHours: {
        weekday: "08:00-22:00",
        weekend: "10:00-18:00",
        holiday: "closed"
      }
    },
    {
      id: 2,
      type: "restroom",
      name: "Boelter Hall - Women's Restroom (floor 1)",
      lat: 34.0690,
      lng: -118.4435,
      building: "Boelter Hall",
      floor: "floor 1",
      gender: "female",
      accessible: true,
      openHours: {
        weekday: "08:00-22:00",
        weekend: "10:00-18:00",
        holiday: "closed"
      }
    },
    {
      id: 3,
      type: "printer",
      name: "Boelter Hall - Printer Station (floor 3)",
      lat: 34.0693,
      lng: -118.4434,
      building: "Boelter Hall",
      floor: "floor 3",
      accessible: true,
      openHours: {
        weekday: "10:00-18:00",
        weekend: "closed",
        holiday: "closed"
      }
    },
    {
      id: 4,
      type: "restroom",
      name: "Kerckhoff Hall - Unisex Restroom (floor B)",
      lat: 34.0705,
      lng: -118.4412,
      building: "Kerckhoff Hall",
      floor: "floor B",
      gender: "unisex",
      accessible: true,
      openHours: {
        weekday: "09:00-21:00",
        weekend: "10:00-18:00",
        holiday: "closed"
      }
    },
    {
      id: 5,
      type: "printer",
      name: "Kerckhoff Hall - Printer (floor 1)",
      lat: 34.0703,
      lng: -118.4413,
      building: "Kerckhoff Hall",
      floor: "floor 1",
      accessible: true,
      openHours: {
        weekday: "09:00-21:00",
        weekend: "closed",
        holiday: "closed"
      }
    },
    {
      id: 6,
      type: "restroom",
      name: "Royce Hall - Men's Restroom (floor 2)",
      lat: 34.0711,
      lng: -118.4419,
      building: "Royce Hall",
      floor: "floor 2",
      gender: "male",
      accessible: true,
      openHours: {
        weekday: "08:00-20:00",
        weekend: "10:00-17:00",
        holiday: "closed"
      }
    },
    {
      id: 7,
      type: "restroom",
      name: "Royce Hall - Women's Restroom (floor 2)",
      lat: 34.0710,
      lng: -118.4420,
      building: "Royce Hall",
      floor: "floor 2",
      gender: "female",
      accessible: true,
      openHours: {
        weekday: "08:00-20:00",
        weekend: "10:00-17:00",
        holiday: "closed"
      }
    },
    {
      id: 8,
      type: "printer",
      name: "YRL - Print Station (floor 1)",
      lat: 34.0740,
      lng: -118.4415,
      building: "Young Research Library",
      floor: "floor 1",
      accessible: true,
      openHours: {
        weekday: "08:00-23:00",
        weekend: "10:00-18:00",
        holiday: "closed"
      }
    },
    {
      id: 9,
      type: "restroom",
      name: "YRL - Unisex Restroom (floor 1)",
      lat: 34.0741,
      lng: -118.4414,
      building: "Young Research Library",
      floor: "floor 1",
      gender: "unisex",
      accessible: true,
      openHours: {
        weekday: "08:00-23:00",
        weekend: "10:00-18:00",
        holiday: "closed"
      }
    },
    {
      id: 10,
      type: "printer",
      name: "Anderson School - Printer (floor 2)",
      lat: 34.0749,
      lng: -118.4418,
      building: "Anderson School",
      floor: "floor 2",
      accessible: true,
      openHours: {
        weekday: "09:00-17:00",
        weekend: "closed",
        holiday: "closed"
      }
    }
  ];
  
// Utility function to calculate Euclidean distance between two points (lat, lng)
// For now, we use simple straight-line approximation; can be replaced with haversine in future
function calculateDistance(lat1, lng1, lat2, lng2){
    const dx = lat1 - lat2;
    const dy = lng1 - lng2;
    return Math.sqrt(dx * dx + dy * dy);
} 
// Utility: Check if current time is within openHours
function isOpenNow(openHours, isHoliday = false) {
    if (!openHours) return false;
  
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;
  
    // Check day of week (0=Sunday, 6=Saturday)
    const day = now.getDay();
    const isWeekend = day === 0 || day === 6;
  
    //  handle holiday logic first
    if (isHoliday && openHours.holiday) {
      const holidayHours = openHours.holiday;
      if (holidayHours === "closed") return false;
      if (holidayHours === "24H") return true;
      const [start, end] = holidayHours.split("-");
      return start <= currentTime && currentTime <= end;
    }
  
    //  Normal weekday/weekend logic
    const period = isWeekend ? openHours.weekend : openHours.weekday;
    if (!period || period === "closed") return false;
    if (period === "24H") return true;
  
    const [start, end] = period.split("-");
    return start <= currentTime && currentTime <= end;
  }

/**
 * GET /api/map/nearest
 * This route returns the closest available facility (restroom or printer),
 * filtered by:
 *  - type (required): restroom or printer
 *  - gender (optional): male, female, unisex (restroom only)
 *  - accessible (optional): true → only show accessible facilities
 *  - openHours (automatic): filter out currently closed ones
 */
router.get("/nearest", (req, res) => {
    const { lat, lng, type, gender, accessible } = req.query;
  
    // Validate required parameters
    if (!lat || !lng || !type) {
      return res.status(400).json({ error: "Missing required parameters: lat, lng, or type" });
    }
  
    // Convert coordinates
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const needsAccessible = accessible === "true";
  
    // Manually set holiday flag for now
    const isHoliday = false; // You can later make this dynamic
  
    // Filter fakeLocations
    let filtered = fakeLocations.filter(loc => {
      // Match type
      if (loc.type !== type) return false;
  
      // Match gender (restroom only)
      if (type === "restroom" && gender && loc.gender !== gender) return false;
  
      // Match accessibility
      if (needsAccessible && !loc.accessible) return false;
  
      // Check open hours based on day/time
      if (!isOpenNow(loc.openHours, isHoliday)) return false;
  
      return true;
    });
  
    // Handle empty result
    if (filtered.length === 0) {
      return res.status(404).json({ error: "No available facilities matching your criteria." });
    }
  
    // Find the nearest one
    const nearest = filtered.reduce((prev, curr) => {
      const prevDist = calculateDistance(userLat, userLng, prev.lat, prev.lng);
      const currDist = calculateDistance(userLat, userLng, curr.lat, curr.lng);
      return currDist < prevDist ? curr : prev;
    });
  
    // Return it
    return res.json(nearest);
  });
  

// Exprot the router
module.exports = router;