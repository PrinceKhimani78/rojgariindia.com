export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const taluka = searchParams.get("taluka");

  if (!taluka) {
    return Response.json(
      { error: "Taluka parameter is required" },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(
      `https://india-location-hub.in/api/locations/villages?taluka=${encodeURIComponent(taluka)}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch villages");
    }

    const data = await response.json();

    return Response.json(data);
  } catch (error) {
    return Response.json(
      { error: "Unable to fetch villages" },
      { status: 500 },
    );
  }
}
