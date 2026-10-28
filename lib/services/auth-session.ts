import AsyncStorage from "@react-native-async-storage/async-storage";
import * as KeyChain from "react-native-keychain";
import type { BackendUserRole, User } from "@/lib/types";

const AUTH_USER_STORAGE_KEY = "authUser";
const AUTH_TOKEN_STORAGE_KEY = "authToken";
const AUTH_REFRESH_TOKEN_STORAGE_KEY = "authRefreshToken";
const CURRENT_USER_ID_STORAGE_KEY = "currentUserId";

export type BackendUser = Partial<User> & {
  _id?: string;
  userId?: string;
  role?: BackendUserRole;
  roles?: BackendUserRole[];
  permissions?: string[];
  investment?: boolean;
  tenant?: boolean;
};

function decodeBase64(value: string): string | null {
  try {
    if (typeof globalThis.atob === "function") {
      return globalThis.atob(value);
    }
    return null;
  } catch {
    return null;
  }
}

function mapBackendRolesToSystemRole(
  roles?: BackendUserRole[],
  systemRole?: BackendUserRole,
  role?: BackendUserRole,
): BackendUserRole {
  const normalizedRoles =
    roles?.map((item) => item.toUpperCase() as BackendUserRole) ?? [];
  const normalizedSystemRole = systemRole?.toUpperCase() as
    | BackendUserRole
    | undefined;
  const normalizedRole = role?.toUpperCase() as BackendUserRole | undefined;

  if (normalizedRoles.includes("ADMIN")) {
    return "ADMIN";
  }

  if (normalizedRoles.includes("COORDINATOR")) {
    return "COORDINATOR";
  }

  if (normalizedRoles.includes("AGENT")) {
    return "AGENT";
  }

  if (normalizedRole) {
    return normalizedRole;
  }

  if (normalizedSystemRole) {
    return normalizedSystemRole;
  }

  return "CLIENT";
}

function deriveInvestmentFlag(
  permissions?: string[],
  investment?: boolean,
): boolean {
  if (typeof investment === "boolean") return investment;

  const normalizedPermissions =
    permissions?.map((item) => item.toUpperCase()) ?? [];
  return normalizedPermissions.includes("INVESTOR");
}

function deriveTenantFlag(permissions?: string[], tenant?: boolean): boolean {
  if (typeof tenant === "boolean") return tenant;

  const normalizedPermissions =
    permissions?.map((item) => item.toUpperCase()) ?? [];
  return normalizedPermissions.includes("TENANT");
}

export function normalizeAuthUser(
  user: BackendUser | User | null,
): User | null {
  if (!user) return null;

  const backendUser = user as BackendUser;
  const agentPresentation = Boolean(
    user.agentpresentation ?? user.agentPresentation ?? false,
  );

  return {
    id: user.id ?? "",
    name: user.name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    country: user.country ?? backendUser.country ?? null,
    systemRole: mapBackendRolesToSystemRole(
      backendUser.roles,
      user.systemRole,
      backendUser.role,
    ),
    roles: backendUser.roles ?? user.roles,
    investment: deriveInvestmentFlag(
      backendUser.permissions,
      backendUser.investment,
    ),
    tenant: deriveTenantFlag(backendUser.permissions, backendUser.tenant),
    permissions: backendUser.permissions ?? user.permissions,
    avatar: user.avatar,
    profilePhotoKey: user.profilePhotoKey,
    agentPresentationKey: user.agentPresentationKey,
    agentpresentation: agentPresentation,
    agentPresentation: agentPresentation,
    agentLeadNotion: (user as User).agentLeadNotion,
    createdAt: user.createdAt ?? new Date().toISOString(),
  };
}

export function buildSessionUser(
  user: BackendUser | User | null,
  token: string | null,
): User | null {
  const normalizedUser = normalizeAuthUser(user);
  const sessionUser = normalizedUser
    ? { ...normalizedUser, id: normalizedUser.id ||  "" }
    : null;

  return sessionUser;
}

export type PersistedAuthSession = {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
};

export async function persistAuthSession(
  user: User | null,
  token: string | null,
  refreshToken: string | null = null,
): Promise<void> {
  if (user?.id) {
    await KeyChain.setGenericPassword("auth", user.id, {
      service: CURRENT_USER_ID_STORAGE_KEY,
    });
    await AsyncStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    await KeyChain.resetGenericPassword({
      service: CURRENT_USER_ID_STORAGE_KEY,
    });
    await AsyncStorage.removeItem(AUTH_USER_STORAGE_KEY);
  }

  if (token) {
    await KeyChain.setGenericPassword("auth", token, {
      service: AUTH_TOKEN_STORAGE_KEY,
    });
  } else {
    await KeyChain.resetGenericPassword({
      service: AUTH_TOKEN_STORAGE_KEY,
    });
  }

  if (refreshToken) {
    await KeyChain.setGenericPassword("auth", refreshToken, {
      service: AUTH_REFRESH_TOKEN_STORAGE_KEY,
    });
  } else {
    await KeyChain.resetGenericPassword({
      service: AUTH_REFRESH_TOKEN_STORAGE_KEY,
    });
  }
}

export async function loadPersistedAuthSession(): Promise<PersistedAuthSession> {
  const [storedUser, tokenCredentials, refreshCredentials] = await Promise.all([
    AsyncStorage.getItem(AUTH_USER_STORAGE_KEY),
    KeyChain.getGenericPassword({
      service: AUTH_TOKEN_STORAGE_KEY,
    }),
    KeyChain.getGenericPassword({
      service: AUTH_REFRESH_TOKEN_STORAGE_KEY,
    }),
  ]);

  let user: User | null = null;
  if (storedUser) {
    try {
      user = JSON.parse(storedUser) as User;
    } catch {
      user = null;
    }
  }

  return {
    user,
    token: tokenCredentials ? tokenCredentials.password : null,
    refreshToken: refreshCredentials ? refreshCredentials.password : null,
  };
}

export async function clearPersistedAuthToken(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  await KeyChain.resetGenericPassword({
    service: AUTH_TOKEN_STORAGE_KEY,
  });
  await AsyncStorage.multiRemove([
    AUTH_USER_STORAGE_KEY,
    AUTH_TOKEN_STORAGE_KEY,
    AUTH_REFRESH_TOKEN_STORAGE_KEY,
    CURRENT_USER_ID_STORAGE_KEY,
  ]);
}

export async function clearPersistedAuthSession(): Promise<void> {
  await KeyChain.resetGenericPassword({
    service: AUTH_TOKEN_STORAGE_KEY,
  });
  await KeyChain.resetGenericPassword({
    service: AUTH_REFRESH_TOKEN_STORAGE_KEY,
  });
  await KeyChain.resetGenericPassword({
    service: CURRENT_USER_ID_STORAGE_KEY,
  });
  await AsyncStorage.removeItem(AUTH_USER_STORAGE_KEY);
}
