export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get("state");

  if (!state) {
    return Response.json(
      { error: "State parameter is required" },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(
      `https://india-location-hub.in/api/locations/districts?state=${encodeURIComponent(state)}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch districts");
    }

    const data = await response.json();

    return Response.json(data);
  } catch (error) {
    return Response.json(
      { error: "Unable to fetch districts" },
      { status: 500 },
    );
  }
}
