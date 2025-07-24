import { Hono } from "hono";
import { renderer } from "./renderer";
import { createClient, Errors } from "@farcaster/quick-auth";
import { HTTPException } from "hono/http-exception";

const app = new Hono();
const client = createClient();

app.use(renderer);

app.get("/", (c) => {
  return c.render(<h1>Hello!</h1>);
});

app.get("/me", async (c) => {
  const authorization = c.req.header("Authorization");
  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "Missing token" });
  }
  try {
    const payload = await client.verifyJwt({
      token: authorization.split(" ")[1],
      domain: c.req.header("host") || "",
    });
    return c.json({ fid: payload.sub });
  } catch (e) {
    if (e instanceof Errors.InvalidTokenError) {
      throw new HTTPException(401, { message: "Invalid token" });
    }
    throw e;
  }
});

export default app;
