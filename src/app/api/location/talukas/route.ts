export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const district = searchParams.get("district");

  if (!district) {
    return Response.json(
      { error: "District parameter is required" },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(
      `https://india-location-hub.in/api/locations/talukas?district=${encodeURIComponent(district)}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch talukas");
    }

    const data = await response.json();

    return Response.json(data);
  } catch (error) {
    return Response.json({ error: "Unable to fetch talukas" }, { status: 500 });
  }
}
