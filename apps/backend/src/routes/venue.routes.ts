import { FastifyInstance } from "fastify";
import axios from "axios";

export default async function venueRoutes(server: FastifyInstance) {
  server.get("/suggestions", { preHandler: [server.authenticate] }, async (request, reply) => {
    const { lat, lng, capacity, radius = 20000 } = request.query as any;

    if (!lat || !lng) {
      return reply.code(400).send({ error: "Latitude and Longitude are required" });
    }

    const categories = [
      "10032", // Music Venue
      "10000", // Arts & Entertainment
      "13003", // Bar
      "18000", // Event Space
      "10052"  // Stadium
    ].join(",");

    try {
      const response = await axios.get("https://api.foursquare.com/v3/places/search", {
        headers: {
          "Authorization": process.env.FOURSQUARE_API_KEY || "MOCK_KEY",
          "Accept": "application/json"
        },
        params: {
          ll: `${lat},${lng}`,
          radius,
          categories,
          limit: 10,
          sort: "DISTANCE",
          fields: "fsq_id,name,location,categories,rating,photos,tel,website"
        }
      });

      const venues = response.data.results.map((place: any) => ({
        fsq_id: place.fsq_id,
        name: place.name,
        address: place.location.formatted_address,
        city: place.location.locality,
        state: place.location.region,
        lat: place.location.lat,
        lng: place.location.lng,
        distance: place.distance,
        rating: place.rating,
        photo_url: place.photos?.[0] ? `${place.photos[0].prefix}300x200${place.photos[0].suffix}` : null,
        category: place.categories?.[0]?.name
      }));

      // Sort by rating desc
      venues.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));

      return {
        capacity_requested: capacity,
        total_found: venues.length,
        venues
      };
    } catch (error) {
      server.log.error(error);
      return reply.code(500).send({ error: "Failed to fetch venue suggestions" });
    }
  });
}
