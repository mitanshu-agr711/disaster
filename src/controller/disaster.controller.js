import supabase from "../services/supabase.js";
import extractLocation from "../services/gimni.js";
import geocode from "../services/map_service.js";

import logAction from "../midddleware/login.middleware.js";
import { getCache, setCache } from "../services/cache.js";
import verifyImageWithGemini from "../services/verifyImage.js";

export const createDisaster = async (req, res, io) => {
  try {
    const { title, description, tags } = req.body;
    const user = req.user?.name;

    if (!title || !description || !user) {
      return res
        .status(400)
        .json({ error: "Title, description, and user are required" });
    }

    if (title.length < 3 || description.length < 10) {
      return res
        .status(400)
        .json({
          error:
            "Title must be at least 3 characters and description at least 10 characters",
        });
    }

    const geminiKey = description;
    let locationName = await getCache(geminiKey);

    if (!locationName) {
      locationName = await extractLocation(description);
      if (locationName) await setCache(geminiKey, locationName, 3600);
    }

    if (!locationName) {
      return res
        .status(400)
        .json({ error: "Location could not be determined" });
    }

    const geoKey = locationName;
    if (!geoKey || geoKey.length < 3) {
      return res
        .status(400)
        .json({ error: "Location name must be at least 3 characters" });
    }

    let coords = await getCache(geoKey);
    if (coords && typeof coords === "string") coords = JSON.parse(coords);

    if (!coords) {
      try {
        coords = await geocode(locationName);
        if (coords) await setCache(geoKey, coords, 3600);
      } catch (error) {
        console.log(`Geocoding error for "${locationName}":`, error.message);
        return res.status(500).json({ error: "Failed to geocode location" });
      }
    }

    const { lat, lon } = coords || {};
    if (typeof lat !== "number" || typeof lon !== "number") {
      return res
        .status(400)
        .json({ error: "Invalid coordinates for the location" });
    }

    const audit = [logAction("created", user, `${title} at ${locationName}`)];

    console.log("Creating disaster with data:", {
      title,
      description,
      tags,
      locationName,
      lat,
      lon,
      user,
      audit,
    });
    const { data, error } = await supabase
      .from("disasters")
      .insert([
        {
          title,
          description,
          tags,
          location_name: locationName,
          latitude: lat,
          longitude: lon,
          owner_id: user,
          created_at: new Date().toISOString(),
          audit_trail: audit,
        
        },
      ])
      .select();

    console.log("Supabase insert response:", { data, error });
    if (error) {
      console.error("Database insert error:", error);
      return res
        .status(500)
        .json({ error: "Failed to create disaster record" });
    }

    console.log("Disaster created successfully:", data[0]);

    // Emit socket event if io is available
    if (io) {
      io.emit("disasterCreated", data[0]);
    }

    // Return success response
    return res.status(201).json({
      message: "Disaster created successfully",
      disaster: data[0],
    });
  } catch (error) {
    console.error("Function error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getDisasters = async (req, res) => {
  try {
    const { tag } = req.query;
    let query = supabase.from("disasters").select("*");
    if (tag) {
      query = query.contains("tags", [tag]);
    }
    const { data, error } = await query;
    if (error) return res.status(500).json({ error });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateDisaster = async (req, res) => {
  try {

    const { id } = req.params;
    const updates = req.body;
    const user = req.user.name;
    console.log("Updating disaster with ID:", id, "Updates:", updates);
  
    const { data: current, error: fetchError } = await supabase
      .from("disasters")
      .select("audit_trail")
      .eq("id", id)
      .single();
    if (fetchError || !current)
      return res.status(404).json({ error: "Disaster not found" });

  
    const audit_trail = current.audit_trail || [];
    audit_trail.push(logAction("updated", user, updates.title || id));

    const { data, error } = await supabase
      .from("disasters")
      .update({ ...updates, audit_trail })
      .eq("id", id)
      .select()
      .single();

    if (error) return res.status(500).json({ error });
    req.app.get("io").emit("disaster_updated", data);
    res.json(data);
  } catch (err) {
    console.error("Update disaster error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteDisaster = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user.name;

    const { data: current, error: fetchError } = await supabase
      .from("disasters")
      .select("audit_trail")
      .eq("id", id)
      .single();
    if (fetchError || !current)
      return res.status(404).json({ error: "Disaster not found" });

    const audit_trail = current.audit_trail || [];
    audit_trail.push(logAction("deleted", user, id));

    // Update audit trail before deletion (optional)
    await supabase.from("disasters").update({ audit_trail }).eq("id", id);

    // Delete
    const { error } = await supabase.from("disasters").delete().eq("id", id);

    if (error) return res.status(500).json({ error });
    req.app.get("io").emit("disaster_updated", { id, deleted: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const geography = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lon } = req.query;
    if (!lat || !lon)
      return res.status(400).json({ error: "lat and lon required" });

    const { data, error } = await supabase.rpc("get_nearby_resources", {
      disaster_id: id,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      radius: 10000, 
    });

    if (error) 
      { console.log("geo",error)
        return res.status(500).json({ error });
      }
    req.app
      .get("io")
      .emit("resources_updated", { disasterId: id, resources: data });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const verifyImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ error: "imageUrl required" });

    const cacheKey = `verify_image_${id}_${imageUrl}`;
    let result = await getCache(cacheKey);
    if (!result) {
      result = await verifyImageWithGemini(imageUrl);
      await setCache(cacheKey, result, 3600);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
