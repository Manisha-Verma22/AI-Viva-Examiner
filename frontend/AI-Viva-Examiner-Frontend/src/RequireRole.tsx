import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { getUser, type Role } from "./api";

/* Only lets a signed-in user with the right role see the page */
export default function RequireRole({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const user = getUser();

  if (!user || user.role !== role) {
    return <Navigate to={`/login/${role}`} replace />;
  }

  return <>{children}</>;
}
