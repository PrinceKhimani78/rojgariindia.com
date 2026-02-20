export async function GET() {
  try {
    const response = await fetch(
      "https://india-location-hub.in/api/locations/states",
      {
        method: "GET",
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch states");
    }

    const data = await response.json();

    return Response.json(data);
  } catch (error) {
    return Response.json({ error: "Unable to fetch states" }, { status: 500 });
  }
}
