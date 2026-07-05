function reply(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": status === 200
        ? "public, s-maxage=60, stale-while-revalidate=120"
        : "no-store"
    }
  });
}

export default {
  async fetch(request) {
    if (request.method !== "GET") {
      return reply({ error: "Method not allowed." }, 405);
    }

    const url = new URL(request.url);
    const airport = (url.searchParams.get("airport") || "").toUpperCase();
    const direction = url.searchParams.get("direction") === "arrivals"
      ? "arrival"
      : "departure";

    if (!/^[A-Z]{3}$/.test(airport)) {
      return reply({ error: "Invalid airport code." }, 400);
    }

    const key = process.env.AVIATIONSTACK_API_KEY;
    if (!key) {
      return reply({ error: "Live flight data is not configured." }, 503);
    }

    const query = new URLSearchParams({
      access_key: key,
      [`${direction}_iata`]: airport,
      limit: "100"
    });

    try {
      const upstream = await fetch(`https://api.aviationstack.com/v1/flights?${query}`);
      const payload = await upstream.json();

      if (!upstream.ok || payload.error) {
        return reply({
          error: payload.error?.message || "Flight provider unavailable."
        }, 502);
      }

      const flights = (payload.data || []).map(flight => ({
        id: `${flight.flight?.iata || flight.flight?.icao}-${flight.flight_date}-${direction}`,
        flight: flight.flight?.iata || flight.flight?.icao || "—",
        airline: flight.airline?.name || "Unknown airline",
        city: direction === "arrival"
          ? flight.departure?.airport
          : flight.arrival?.airport,
        code: direction === "arrival"
          ? flight.departure?.iata
          : flight.arrival?.iata,
        scheduled: direction === "arrival"
          ? flight.arrival?.scheduled
          : flight.departure?.scheduled,
        estimated: direction === "arrival"
          ? flight.arrival?.estimated
          : flight.departure?.estimated,
        actual: direction === "arrival"
          ? flight.arrival?.actual
          : flight.departure?.actual,
        terminal: direction === "arrival"
          ? flight.arrival?.terminal
          : flight.departure?.terminal,
        gate: direction === "arrival"
          ? flight.arrival?.gate
          : flight.departure?.gate,
        status: flight.flight_status || "scheduled"
      }));

      return reply({ flights, source: "live" });
    } catch {
      return reply({ error: "Could not reach the flight provider." }, 502);
    }
  }
};
