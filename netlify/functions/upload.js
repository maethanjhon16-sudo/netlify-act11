// netlify/functions/upload.js
const { createClient } = require("@supabase/supabase-js");

exports.handler = async (event) => {
  try {
    const { filename, fileContent } = JSON.parse(event.body);

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    const base64Data = Buffer.from(fileContent, "base64");
    const path = `uploads/${Date.now()}-${filename}`;

    const { error } = await supabase.storage
      .from("uploads")
      .upload(path, base64Data, {
        contentType: "application/octet-stream"
      });

    if (error) throw error;

    const publicUrl =
      supabase.storage.from("uploads").getPublicUrl(path).data.publicUrl;

    return {
      statusCode: 200,
      body: JSON.stringify({ uploaded: true, url: publicUrl }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
