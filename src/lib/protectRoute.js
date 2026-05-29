import { cookies } from "next/headers";

import { verifyToken } from "./jwt";


export async function getUser() {
  const cookieStore = await cookies();

  const token = cookieStore.get("auth")?.value;

  if (!token) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = verifyToken(token);

  if (!user) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  else if(user){
    console.log(user);
    return Response.json({ message: "authorized" }, { status: 200 });
  }

  return user;
}
