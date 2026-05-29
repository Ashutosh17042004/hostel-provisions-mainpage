import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export function withAuth(handler) {
  return async function (req, context) {
    try {
      const token = req.cookies.get("auth")?.value;

      if (!token) {
        return NextResponse.json(
          { message: "Unauthorized" },
          { status: 401 }
        );
      }

      const decoded = verifyToken(token);

      if (!decoded) {
        return NextResponse.json(
          { message: "Invalid token" },
          { status: 401 }
        );
      }

      // attach user data
      req.user = decoded;

      return handler(req, context);
    } catch (error) {
      return NextResponse.json(
        { message: "Authentication failed" },
        { status: 500 }
      );
    }
  };
}